/* TODO:
 * correspond tab button colors with color of saved tabs within the tab button
 * buttons will go into workspace that will be able to be named, pulldown that will show button tabs
 * option to create workspace
 * close all tabs with specific color (icons below color buttons)
 * add context menu for saving all tabs
 * save current colored tabs textfield should be colored according to current tab's color
*/

/* FIXME:
 * buttonCount is inefficient, fix by using an array of object and .length
 * setting groupCount on installation might delete user's tabs if extension is updated, fix
 * background color of top half of popup is not working
 * change favicon colors to match button colors
 * use favIconUrl instead of "shortcut icon" to better change favicon url?
 * if page is launched with bookmark icon, changing favicon colors will change bookmark icon as well;
   however, if bookmark icon is clicked again, icon will reset
 * w3schools.com's favicon is not able to be changed (certain websites?)
 * will still some tabs even if tab is not colored
*/

/* Storage Explanation
 * groupCount: tracks the number of buttons when adding and deleting buttons
 * buttonCount: tracks the number of buttons when adding (reset to 0 when there are 0 buttons)
 * groupName: name of the button given by the user
 * tabNames: names of the tabs
 * tabUrls: urls of the tabs
 * tabCount: number of tabs in the window
*/

// opens shortcut url upon extension installation
chrome.runtime.onInstalled.addListener(onInstall);

/* runs on installation of extension */
function onInstall()
{
	chrome.storage.local.clear();
	// chrome.storage.local.get(null, function(items) 
	// {
	// 	var allKeys = Object.keys(items);
	// 	console.log("storage: " + allKeys);
	// })

	chrome.storage.local.set({"groupCount": 0});   // FIXME: will this delete tabs if extension is updated?
	chrome.storage.local.set({"buttonCount": 0});

	chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Tabs of Current Tab Color"});
	chrome.contextMenus.create({"id": "redFavicon", "title": "Red"});
	chrome.contextMenus.create({"id": "greenFavicon", "title": "Green"});
	chrome.contextMenus.create({"id": "blueFavicon", "title": "Blue"});
	chrome.contextMenus.create({"id": "orangeFavicon", "title": "Orange"});
	chrome.contextMenus.create({"id": "yellowFavicon", "title": "Yellow"});
	chrome.contextMenus.create({"id": "purpleFavicon", "title": "Purple"});

	// TODO: add customized tab for first install
    //chrome.tabs.create({url: "chrome://extensions/shortcuts"});
}

// when command is executed, determine which command was executed
chrome.commands.onCommand.addListener(ActivityTabFeatures);

// when context menu icon is clicked, determine which context menu was clicked
chrome.contextMenus.onClicked.addListener(ActivityTabFeatures);

/* for commands and context menu */
function ActivityTabFeatures(command)
{
	/* commands */
	switch(command)
	{
		/* color change to left */
		case "left-key-toggle-feature":
			queryKeys("left-key-toggle-feature");
			break;
		/* color change to right */
		case "right-key-toggle-feature":
			queryKeys("right-key-toggle-feature");
			break;
		/* retitle current tab */
		case "custom-title-toggle-feature":
			chrome.tabs.query({active: true, currentWindow: true}, function (tabs) 
			{
				var promptUser = prompt("Rename tab:");

				// title sent to content script
				chrome.tabs.sendMessage(tabs[0].id, {title: promptUser}, function(response){});
				// saves for persistent title through refresh
				saveTitle[tabs[0].id] = promptUser;

				// chrome.tabs.query({currentWindow: true, active: true}, function(tab)
				// {
				// 	console.log("TITLE CHANGED, RELOAD");
				// 	var code = 'window.location.reload();';
				// 	chrome.tabs.executeScript(tab.id, {code: code});
				// })
			})
			break;
		case "same-color-tabs-toggle-feature":
			sameColorTabs(command);
			break;
	}

	/* context menus */
	switch (command.menuItemId)
	{
		case "sameColorTabs":
			sameColorTabs(command)
			break;
		case "redFavicon":
			queryContextMenu("buttonPress", "red");
			break;
		case "greenFavicon":
			queryContextMenu("buttonPress", "green");
			break;
		case "blueFavicon":
			queryContextMenu("buttonPress", "blue");
			break;
		case "yellowFavicon":
			queryContextMenu("buttonPress", "yellow");
			break;
		case "orangeFavicon":
			queryContextMenu("buttonPress", "orange");
			break;
		case "purpleFavicon":
			queryContextMenu("buttonPress", "purple");
			break;
	}
}

/* checks if there is a duplicate name and then removes the button at the end that is still
   added because of the first ~asynchronous~ function in sameColorTabs() and storeTabsTextField() */
function checkDuplicateName(promptUser, groupCount, command)
{
	if (promptUser != "" && groupCount != 0)
	{
		/* iterates through the buttons */
		for (var i = 0; i < groupCount; i++)
		{
			chrome.storage.local.get(["groupName" + i, "tabCount" + i], function(i, anotherGroup)
			{
				var groupName = anotherGroup["groupName" + i];
					
				if (groupName == promptUser)
				{
					alert("Duplicate name!");
					var duplicatePrompt = confirm("Would you like to replace the group?");

					if (duplicatePrompt)
					{
						/* if button does launch multiple windows */
						if (command == "same-color-tabs-toggle-feature")
						{
							replaceButton(i, promptUser, command);

						}
						/* button launches multiple windows */
						else if (command == "save-all-tabs")
						{
							replaceAllButton(i, promptUser);
							// chrome.runtime.sendMessage({msg: i});
						}
						// removes added button from asynchronous function since a button is still added
						chrome.storage.local.remove(["groupName" + groupCount, "tabNames" + groupCount, "tabUrls" + groupCount, "tabColor" + groupCount, "tabCount" + groupCount]);
					}
					else
					{
						alert("Please enter a different name for the group!");
						/* only if command had activated prompt, not the save tabs text field */
						if (command)
						{
							ActivityTabFeatures(command);
						}
					}
				}
			// used since asynchronous function would update i before using it; makes for loop work as intended
			}.bind(this, i))
		}
	}
}

/* updates correct button with tab information AND REPLACES BUTTON */
function replaceButton(replacementButton, promptUser, command)
{
	var groupObject = {};

	/* stores all of the tab's information into an object and then puts object into storage */
	chrome.tabs.query({currentWindow: true}, function(tabs)
	{
		/* gets each tab's name and url from an array of tabs and stores them into arrays */
		var tabNamesArr = [];
		var tabUrlsArr = [];
		var tabColorsArr = tabs.map(t => t.favIconUrl);
		var tabCount = 0;

		for (; tabCount < tabs.length; tabCount++)
		{
			tabNamesArr[tabCount] = tabs[tabCount].title;
			tabUrlsArr[tabCount] = tabs[tabCount].url;
		}

		if (command == "same-color-tabs-toggle-feature")
		{
			/* put everything in getSelected because of asynchronous function not initializing currentFaviconURL before storing */
			chrome.tabs.getSelected(null, function(tab)
			{
				var currentFaviconURL = tab.favIconUrl;
				var redURL = chrome.runtime.getURL("img/red-circle-16.png");
				var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
				var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
				var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
				var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
				var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

				/* removes favicon urls that are not colored from tab colors array */
				for (var i = 0; i < tabColorsArr.length; i++)
				{
					if (tabColorsArr[i] != currentFaviconURL)
					{
						tabColorsArr.splice(i, 1);
						// removes name of array as well
						tabNamesArr.splice(i, 1);
						// removes url of array as well
						tabUrlsArr.splice(i, 1);
						// decrements tab count as differe colored tab is removed
						tabCount--;
						// decrement count since array length changed when tab was deleted ([1, 2, 3] = [1, 3] makes arr[2] = undefined so do i--)
						i--;
					}
				}

				// removes info of button to be replaced
				chrome.storage.local.remove(["groupName" + i, "tabNames" + i, "tabUrls" + i, "tabColor" + i, "tabCount" + i]);

				/* button is deleted, so button counter can be decreased by 1 */
				chrome.storage.local.get("buttonCount", function(group2)
				{
					// (i + 1) == last button
					if ((i + 1) == group2.buttonCount)
					{
						var subtractOne = (group2.buttonCount) - 1;
						chrome.storage.local.set({"buttonCount": subtractOne});
					}
				})

				var groupName = "groupName" + replacementButton;
				groupObject[groupName] = promptUser;

				var tabNames = "tabNames" + replacementButton;
				groupObject[tabNames] = tabNamesArr;

				var tabUrls = "tabUrls" + replacementButton;
				groupObject[tabUrls] = tabUrlsArr;

				var tabColor = "tabColor" + replacementButton;
				groupObject[tabColor] = tabColorsArr;

				var tabCount2 = "tabCount" + replacementButton;
				groupObject[tabCount2] = tabCount;

				// puts object into storage
				chrome.storage.local.set(groupObject);

				/* set-up for next group so last group isn't overwritten */
				// enables empty text to be set
				chrome.storage.local.get("buttonCount", function(group2)
				{
					if (group2.buttonCount != 0)
					{
						chrome.storage.local.set({"groupCount": (replacementButton + 1)});
						// tracks number of buttons so it can display them all even if one is deleted
						chrome.storage.local.set({"buttonCount": (replacementButton + 1)});
					}
				})
			})
		}
		/* command from store tabs text field (feature removed)*/
		else
		{
			var groupName = "groupName" + replacementButton;
			groupObject[groupName] = promptUser;
	
			var tabNames = "tabNames" + replacementButton;
			groupObject[tabNames] = tabNamesArr;
	
			var tabUrls = "tabUrls" + replacementButton;
			groupObject[tabUrls] = tabUrlsArr;
	
			var tabColor = "tabColor" + replacementButton;
			groupObject[tabColor] = tabColorsArr;
	
			var tabCount2 = "tabCount" + replacementButton;
			groupObject[tabCount2] = tabCount;
	
			// puts object into storage
			chrome.storage.local.set(groupObject);
		}
	})
}

function replaceAllButton(replacementButton, promptUser)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		/* stores the number, name, and urls of the tabs, as well as the group name into an object for storage */
		var groupObject = {};

		/* stores all of the tab's information into an object and then puts object into storage */
		chrome.windows.getAll({populate: true}, function(windows)
		{
			if (windows.length < 2)
			{
				alert("Cannot store tabs since there is only one window!");
				return;
			}

			var tabNamesArr = windows.map(w => w.tabs.map(tab => tab.title));

			console.log("replaceAllButton, tabNamesArr: " + tabNamesArr);

			var tabUrlsArr = windows.map(w => w.tabs.map(tab => tab.url));
			var tabColorsArr = windows.map(w => w.tabs.map(tab => tab.favIconUrl));

			var tabCount = new Array(windows.length);
			var tabCounter = 0;
			var windowCounter = 0;
				
			/* store tab count for each window */
			windows.forEach(function(window)
			{
				window.tabs.forEach(function(tab)
				{
					tabCounter++;
				})
				tabCount[windowCounter] = tabCounter;
				console.log("windowCounter: " + windowCounter);
				console.log("TabCount[windowCounter]: " + tabCount[windowCounter]);
				// reset tabCounter for next window
				tabCounter = 0;
				// for iterating through windows
				windowCounter++;
			})

			var groupName = "groupName" + replacementButton;
			groupObject[groupName] = promptUser;

			var tabNames = "tabNames" + replacementButton;
			groupObject[tabNames] = tabNamesArr;

			var tabUrls = "tabUrls" + replacementButton;
			groupObject[tabUrls] = tabUrlsArr;

			var tabColor = "tabColor" + replacementButton;
			groupObject[tabColor] = tabColorsArr;

			var tabCount2 = "tabCount" + replacementButton;
			groupObject[tabCount2] = tabCount;

			console.log("groupObject: " + groupObject);
			// puts object into storage
			chrome.storage.local.set(groupObject);
			
			// sends a message to popup script so sort tabs text field's border color will update from command
			chrome.runtime.sendMessage({msg: "color command"});
		})
	})
}

function sameColorTabs(command)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		// console.log("before group name");

		var promptUser = prompt("Group name: ");

		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			sameColorTabs(command);
		}
		/* stores the number, name, and urls of the tabs, as well as the group name into an object for storage */
		else
		{
			var groupObject = {};

			/* stores all of the tab's information into an object and then puts object into storage */
			chrome.tabs.query({currentWindow: true}, function(tabs)
			{
				/* gets each tab's name and url from an array of tabs and stores them into arrays */
				var tabNamesArr = [];
				var tabUrlsArr = [];
				var tabColorsArr = tabs.map(t => t.favIconUrl);
				// var tabColorsArr = [];
				var tabCount = 0;

				for (; tabCount < tabs.length; tabCount++)
				{
					tabNamesArr[tabCount] = tabs[tabCount].title;
					tabUrlsArr[tabCount] = tabs[tabCount].url;
					// tabColorsArr[tabCount] = tabs[tabCount].favIconUrl;
				}

				/* put everything in getSelected because of asynchronous function not initializing currentFaviconURL before storing */
				chrome.tabs.getSelected(null, function(tab)
				{
					var currentFaviconURL = tab.favIconUrl;
					var redURL = chrome.runtime.getURL("img/red-circle-16.png");
					var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
					var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
					var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
					var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
					var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

					/* removes favicon urls that are not colored from tab colors array */
					for (var i = 0; i < tabColorsArr.length; i++)
					{
						if (tabColorsArr[i] != currentFaviconURL)
						{
							tabColorsArr.splice(i, 1);
							// removes name of array as well
							tabNamesArr.splice(i, 1);
							// removes url of array as well
							tabUrlsArr.splice(i, 1);
							// decrements tab count as differe colored tab is removed
							tabCount--;
							// decrement count since array length changed when tab was deleted (ex: [1, 2, 3] = [1, 3] makes arr[2] = undefined so do i--)
							i--;
						}
					}

					var groupName = "groupName" + groupCount;
					groupObject[groupName] = promptUser;

					var tabNames = "tabNames" + groupCount;
					groupObject[tabNames] = tabNamesArr;

					var tabUrls = "tabUrls" + groupCount;
					groupObject[tabUrls] = tabUrlsArr;

					var tabColor = "tabColor" + groupCount;
					groupObject[tabColor] = tabColorsArr;

					var tabCount2 = "tabCount" + groupCount;
					groupObject[tabCount2] = tabCount;

					// puts object into storage
					chrome.storage.local.set(groupObject);

					/* checks if duplicate name */
					checkDuplicateName(promptUser, groupCount, command);

					/* set-up for next group so last group isn't overwritten */
					// enables empty text to be set
					chrome.storage.local.set({"groupCount": (groupCount + 1)});
					// tracks number of buttons so it can display them all even if one is deleted
					chrome.storage.local.set({"buttonCount": (groupCount + 1)});
				})
			})
		}
	})
}

/* sends messages with command info */
function queryKeys(item)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// console.log("queryKeys, sending COMMAND message, tabs[0].id: " + tabs[0].id);
		// sends command to content script
		// selected tab, {command property = command}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {command: item}, function(response) {});
		// sends a message to popup script so sort tabs text field's border color will update from command
		chrome.runtime.sendMessage({msg: "color command"});
		// console.log("queryKeys, sending message, tabs[0].id: " + tabs[0].id);
	})
}

/* sends message with context menu info to content.js */
function queryContextMenu(buttonPress, color)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// selected tab, {button property = context menu pressed, color property = button color}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {button: buttonPress, color: color}, function(response) {});
	})
}

function storeSortTabsTextField(storeSortTabsTextField)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		// console.log("before group name");

		var promptUser = storeSortTabsTextField;

		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			storeSortTabsTextField(command);
		}
		/* stores the number, name, and urls of the tabs, as well as the group name into an object for storage */
		else
		{
			var groupObject = {};

			/* stores all of the tab's information into an object and then puts object into storage */
			chrome.tabs.query({currentWindow: true}, function(tabs)
			{
				/* gets each tab's name and url from an array of tabs and stores them into arrays */
				var tabNamesArr = [];
				var tabUrlsArr = [];
				var tabColorsArr = tabs.map(t => t.favIconUrl);
				// var tabColorsArr = [];
				var tabCount = 0;

				for (; tabCount < tabs.length; tabCount++)
				{
					tabNamesArr[tabCount] = tabs[tabCount].title;
					tabUrlsArr[tabCount] = tabs[tabCount].url;
					// tabColorsArr[tabCount] = tabs[tabCount].favIconUrl;
				}

				/* put everything in getSelected because of asynchronous function not initializing currentFaviconURL before storing */
				// looks at color of current tab to determine which tabs should be removed from the color arr (tabs that dont match color)
				chrome.tabs.getSelected(null, function(tab)
				{
					var currentFaviconURL = tab.favIconUrl;
					var redURL = chrome.runtime.getURL("img/red-circle-16.png");
					var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
					var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
					var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
					var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
					var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

					/* removes favicon urls that are not colored from tab colors array */
					for (var i = 0; i < tabColorsArr.length; i++)
					{
						if (tabColorsArr[i] != currentFaviconURL)
						{
							tabColorsArr.splice(i, 1);
							// removes name of array as well
							tabNamesArr.splice(i, 1);
							// removes url of array as well
							tabUrlsArr.splice(i, 1);
							// decrements tab count as differe colored tab is removed
							tabCount--;
							// decrement count since array length changed when tab was deleted ([1, 2, 3] = [1, 3] makes arr[2] = undefined so do i--)
							i--;
						}
					}

					var groupName = "groupName" + groupCount;
					groupObject[groupName] = promptUser;

					var tabNames = "tabNames" + groupCount;
					groupObject[tabNames] = tabNamesArr;

					var tabUrls = "tabUrls" + groupCount;
					groupObject[tabUrls] = tabUrlsArr;

					var tabColor = "tabColor" + groupCount;
					groupObject[tabColor] = tabColorsArr;

					var tabCount2 = "tabCount" + groupCount;
					groupObject[tabCount2] = tabCount;

					// puts object into storage
					chrome.storage.local.set(groupObject);

					/* checks if duplicate name */
					// specified command to have duplicate checked the same way as the sort colors command
					checkDuplicateName(promptUser, groupCount, "same-color-tabs-toggle-feature");

					/* set-up for next group so last group isn't overwritten */
					// enables empty text to be set
					chrome.storage.local.set({"groupCount": (groupCount + 1)});
					// tracks number of buttons so it can display them all even if one is deleted
					chrome.storage.local.set({"buttonCount": (groupCount + 1)});
				})
			})
		}
	})
}

function storeAllTabsTextField(storeAllTabsTextField)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		// console.log("before group name");

		var promptUser = storeAllTabsTextField;

		// limit text so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			storeAllTabsTextField(command);
		}
		/* stores the number, name, and urls of the tabs, as well as the group name into an object for storage */
		else
		{
			var groupObject = {};

			/* stores all of the tab's information into an object and then puts object into storage */
			chrome.windows.getAll({populate: true}, function(windows)
			{
				if (windows.length < 2)
				{
					alert("Cannot store tabs since there is only one window!");
					return;
				}

				var tabNamesArr = windows.map(w => w.tabs.map(tab => tab.title));
				var tabUrlsArr = windows.map(w => w.tabs.map(tab => tab.url));
				var tabColorsArr = windows.map(w => w.tabs.map(tab => tab.favIconUrl));

				var tabCount = new Array(windows.length);
				var tabCounter = 0;
				var windowCounter = 0;
				
				/* store tab count for each window */
				windows.forEach(function(window)
				{
					window.tabs.forEach(function(tab)
					{
						tabCounter++;
					})
					tabCount[windowCounter] = tabCounter;
					// reset tabCounter for next window
					tabCounter = 0;
					// for iterating through windows
					windowCounter++;
				})

				var groupName = "groupName" + groupCount;
				groupObject[groupName] = promptUser;

				var tabNames = "tabNames" + groupCount;
				groupObject[tabNames] = tabNamesArr;

				console.log("tabNamesArr: " + tabNamesArr);

				var tabUrls = "tabUrls" + groupCount;
				groupObject[tabUrls] = tabUrlsArr;

				var tabColor = "tabColor" + groupCount;
				groupObject[tabColor] = tabColorsArr;

				var tabCount2 = "tabCount" + groupCount;
				groupObject[tabCount2] = tabCount;

				// console.log("groupObject: " + groupObject);
				// puts object into storage
				chrome.storage.local.set(groupObject);

				/* checks if duplicate name */
				// specified command to have duplicate checked the same way as the sort colors command
				checkDuplicateName(promptUser, groupCount, "save-all-tabs");

				/* set-up for next group so last group isn't overwritten */
				// enables empty text to be set
				chrome.storage.local.set({"groupCount": (groupCount + 1)});
				// tracks number of buttons so it can display them all even if one is deleted
				chrome.storage.local.set({"buttonCount": (groupCount + 1)});
			})
		}
	})
}

/* creates tabs for multiple windows */
function createAllTabs(group, i, j)
{
	chrome.windows.create({"url": group["tabUrls" + i][j], "state": "maximized"}, function(window)
	{
		console.log("createAllTabs, tabNamesArr: " + group["tabNames" + i]);
		/* iterates through the tabs of a window to put tab names and tab color */
		for (var k = 0; k < group["tabUrls" + i][j].length; k++)
		{
			/* saves title of tab */
			var tabTitle = group["tabNames" + i][j][k];
			console.log("tabTitle: " + tabTitle);
			console.log("window.tabs[k]: " + window.tabs[k].id);
			// make sure it's window.tabS as shown in documentation
			tabIdsToTitles[window.tabs[k].id] = tabTitle;
	
			/* saves color of tab */
			var tabColor = group["tabColor" + i][j][k];
			tabIdsToColor[window.tabs[k].id] = tabColor;
		}
		console.log('group["tabNames" + i]: ' + group["tabNames" + i]);
		console.log('group["tabColors" + i]: ' + group["tabColors" + i]);

		console.log('group["tabNames" + i][j]: ' + group["tabNames" + i][j]);
		console.log('group["tabColors" + i][j]: ' + group["tabColors" + i][j]);
		k++;
	})
}

// stores title of tab for later use when tab is fully updated
var tabIdsToTitles = {};
// stores color of tab for later use when tab is fully updated
var tabIdsToColor = {};

/* creates the tabs */
function createTab(group, i, j)
{
    chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
    {
		/* saves title of tab */
        var tabTitle = group["tabNames" + i][j];
		tabIdsToTitles[tab.id] = tabTitle;

		/* saves color of tab */
		var tabColor = group["tabColor" + i][j];
		tabIdsToColor[tab.id] = tabColor;

		/* colors popup buttons if tab is colored */

		// var redURL = chrome.runtime.getURL("img/red-circle-16.png");
		// var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
		// var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
		// var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
		// var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
		// var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

		// switch(tabColor)
		// {
		// 	case redURL:
		// 		chrome.runtime.sendMessage({msg: "color buttons: red"});
		// 		break;
		// 	case greenURL:
		// 		chrome.runtime.sendMessage({msg: "color buttons: green"});
		// 		break;
		// 	case blueURL:
		// 		chrome.runtime.sendMessage({msg: "color buttons: blue"});
		// 		break;
		// 	case yellowURL:
		// 		chrome.runtime.sendMessage({msg: "color buttons: yellow"});
		// 		break;
		// 	case orangeURL:
		// 		chrome.runtime.sendMessage({msg: "color buttons: orange"});
		// 		break;
		// 	case purpleURL:
		// 		chrome.runtime.sendMessage({msg: "color buttons: purple"});
		// 		break;
		// 	default:
		// 		break;
		// }
    })
}

/* creates the tabs in a new window */
function createWindowTabs(group, i, j)
{
	// creates a window with first url
	if (j == 0)
	{
		chrome.windows.create({"url": group["tabUrls" + i][j], "state": "maximized"}, function(window)
		{
			// accesses window's array of tabs to access first tab's id
			var firstTabInWindow = window.tabs[0].id;

			var tabTitle = group["tabNames" + i][j];
			tabIdsToTitles[firstTabInWindow] = tabTitle;
			var tabColor = group["tabColor" + i][j];
			tabIdsToColor[firstTabInWindow] = tabColor;
		})
	}
	else
	{
		chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
		{
			// console.log("Created url: " + group["tabUrls" + i][j] + ", " + group["tabNames" + i][j]);
			var tabTitle = group["tabNames" + i][j];
			tabIdsToTitles[tab.id] = tabTitle;
			// console.log("set tabIdsToTitles[tab.id]: " + tabIdsToTitles[tab.id]);

			var tabColor = group["tabColor" + i][j];
			tabIdsToColor[tab.id] = tabColor;
			// console.log("set tabIdsToColor[tab.id]: " + tabIdsToColor[tab.id]);
		})
	}
}

/* once content script has finished loading in the new tab, send message (title) to the tab,
   keeps title and color from SAVED tabs persistent through refresh */
// content script would not be able to received message if page has not loaded
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo)
{
	// console.log("onupdated");
	/* tab has been fully loaded */
	// console.log("tabIdsToTitles[tabId]: " + tabIdsToTitles[tabId]);
	// console.log("changeInfo.status: " + changeInfo.status);
	if (tabIdsToTitles[tabId] && changeInfo.status === "complete")
	{
		// console.log("complete");
		chrome.tabs.sendMessage(tabId, {getTitle: tabIdsToTitles[tabId]}, function(response){});
		// console.log("send tabIdsToTitles[tabId] to content.js: " + tabIdsToTitles[tabId] + ", id: " + tabId);
		// console.log("send tabIdsToColor[tab.id] to content.js: " + tabIdsToColor[tabId] + ", id: " + tabId);
		chrome.tabs.sendMessage(tabId, {getColor: tabIdsToColor[tabId]}, function(response){});
	}
})

/* for keeping title through tab refresh */
var saveTitle = {};
var saveColor = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
	// console.log("CHROME.RUNTIME.ONMESSAGE------------------------------------");
	// console.log("background.js got a message")
    // console.log("request: " + request);
    // console.log("sender: " + sender);

	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		// console.log("CHROME.TABS.QUERY1-------------------------------------------");
		// console.log("request: " + request);
		saveColor[tab[0].id] = request;
		// console.log("SAVED COLOR: " + saveColor[tab[0].id]);
	})

	sendResponse();
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	/* title was changed */
	// console.log("CHROME.TABS.ONUPDATED-----------------------------------");
	// console.log("saves title updated");
	if (saveTitle[tabId] != null)
	{
		// console.log("title sent to content script");
		// title sent to content script
    	chrome.tabs.sendMessage(tabId, {title: saveTitle[tabId]}, function(response){});
	}

	// console.log("right before query2");
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		// console.log("CHROME.TABS.QUERY2-----------------------------------");
		// console.log("tab[0].id: " + tab[0].id);
		// if (saveColor[tab[0].id] == undefined)
		// {
		// 	console.log("saveColor[tab[0].id] is UNDEFINED");
		// }
		// else
		// {
		// 	console.log("saveColor[tab[0].id]: " + saveColor[tab[0].id]);
		// }

		/* does not send message to content script if the tab is not colored */
		if (saveColor[tab[0].id] != undefined)
		{
			console.log("tab[0]: " + tab[0]);
			console.log("tab[0].favIconURL: " + tab[0].favIconURL);
			console.log("color sent to content script, saveColor[tab[0].id: " + saveColor[tab[0].id]);
			chrome.tabs.sendMessage(tabId, {color: saveColor[tab[0].id]}, function(response){});
		}
	})
})

/* deletes tab color that is saved in saveColor if color button is pressed;
   if not deleted, asynchronous function calls would make saveColor override color from the button */
function deleteSaveColor(color)
{
	// console.log("DELETESAVECOLOR--------------------------------------");
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		// in case same color button is pressed
		if (saveColor[tab[0].id] != color)
		{
			delete saveColor[tab[0].id];
			// sets saveColor[tab[0].id] to changed color so that the new color is saved
			saveColor[tab[0].id] = color;
		}
	})
}