/* TODO:
 * command(s) and buttons that will save tabs of the same color
 * correspond tab button colors with color of saved tabs within the tab button
 * command that will save all of the tabs (has unique color)
 * buttons will go into workspace that will be able to be named, pulldown that will show button tabs
 * option to create workspace
 * close all tabs with specific color (button next to trash?)
*/

/* FIXME:
 * buttonCount is inefficient, fix by using an array of object and .length
 * setting groupCount on installation might delete user's tabs if extension is updated, fix
 * background color of top half of popup is not working
 * change favicon colors to match button colors
 * if page is launched with bookmark icon, changing favicon colors will change bookmark icon as well;
   however, if bookmark icon is clicked again, icon will reset
 * w3schools.com's favicon is not able to be changed (certain websites?)
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
			chrome.storage.local.get(["groupName" + i], function(i, anotherGroup)
			{
				var groupName = anotherGroup["groupName" + i];
					
				if (groupName == promptUser)
				{
					alert("Duplicate name!");
					var duplicatePrompt = confirm("Would you like to replace the group?");

					if (duplicatePrompt)
					{
						replaceButton(i, promptUser, command);
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
			}.bind(this, i))   // used since asynchronous function would update i before using it; makes for loop work as intended
		}
	}
}

/* updates correct button with tab information but does not replace button */
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
			})
		}
		/* command from store tabs text field */
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

function sameColorTabs(command)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		console.log("before group name");

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
					checkDuplicateName(promptUser, groupCount, command);

					// set-up for next group so last group isn't overwritten
					chrome.storage.local.set({"groupCount": (groupCount + 1)});   // enables empty text to be set
					chrome.storage.local.set({"buttonCount": (groupCount + 1)});   // tracks number of buttons so it can display them all even if one is deleted
				})
			})
		}
	})
}

/* sends message with command info to content.js */
function queryKeys(item)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// selected tab, {command property = command}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {command: item}, function(response) {});
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

/* stores tabs from text field */
function storeTabsTextField(storeTabsTextField)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		console.log("storeTabsTextField groupCount: " + groupCount);

		var promptUser =  storeTabsTextField;

		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			storeTabsTextField();
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
				var tabCount = 0;

				for (; tabCount < tabs.length; tabCount++)
				{
					tabNamesArr[tabCount] = tabs[tabCount].title;
					tabUrlsArr[tabCount] = tabs[tabCount].url;
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
				checkDuplicateName(promptUser, groupCount, "");

				chrome.storage.local.get(null, function(items) 
				{
					var allKeys = Object.keys(items);
					console.log("after storing button info, storage: " + allKeys);
				})

				// set-up for next group so last group isn't overwritten
				chrome.storage.local.set({"groupCount": (groupCount + 1)});   // enables empty text to be set
				chrome.storage.local.set({"buttonCount": (groupCount + 1)});   // tracks number of buttons so it can display them all even if one is deleted
			})
		}
	})
}

function storeSortTabsTextField(storeSortTabsTextField)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		console.log("before group name");

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

					// set-up for next group so last group isn't overwritten
					chrome.storage.local.set({"groupCount": (groupCount + 1)});   // enables empty text to be set
					chrome.storage.local.set({"buttonCount": (groupCount + 1)});   // tracks number of buttons so it can display them all even if one is deleted
				})
			})
		}
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
		console.log("set tabIdsToColor[tab.id]: " + tabIdsToColor[tab.id]);
    })
}

/* creates the tabs in a new window */
function createWindowTabs(group, i, j)
{
	if (j == 0)
	{
		// creates first tab in a new window
		chrome.windows.create({"url": group["tabUrls" + i][j], "state": "maximized"});
	}
	else
	{
		chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
		{
			var tabTitle = group["tabNames" + i][j];
			tabIdsToTitles[tab.id] = tabTitle;

			var tabColor = group["tabColor" + i][j];
			tabIdsToColor[tab.id] = tabColor;
			console.log("set tabIdsToColor[tab.id]: " + tabIdsToColor[tab.id]);
		})
	}
}

/* once content script has finished loading in the new tab, send message (title) to the tab */
// content script would not be able to received message otherwise
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo)
{
	/* tab has been fully loaded */
	if (tabIdsToTitles[tabId] && changeInfo.status === "complete") 
	{
		chrome.tabs.sendMessage(tabId, {getTitle: tabIdsToTitles[tabId]}, function(response){});
		console.log("send tabIdsToTitles[tabId] to content.js: " + tabIdsToTitles[tabId] + ", id: " + tabId);
		console.log("send tabIdsToColor[tab.id] to content.js: " + tabIdsToColor[tabId] + ", id: " + tabId);
		chrome.tabs.sendMessage(tabId, {getColor: tabIdsToColor[tabId]}, function(response){});
	}
})

/* for keeping title through tab refresh */
var saveTitle = {};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) 
{
	// saves title
	saveTitle[message.id] = message.name;
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	if (saveTitle[tabId] != null)   // title was changed
	{
		// title sent to content script
    	chrome.tabs.sendMessage(tabId, {title: saveTitle[tabId]}, function(response){});
	}
})