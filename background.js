/* TODO:
 * add context menu for saving all tabs
*/

/* FIXME:
 * buttonCount is inefficient, fix by using an array of object and .length
 * setting groupCount on installation might delete user's tabs if extension is updated, fix
 * change favicon colors to match button colors
 * use favIconUrl instead of "shortcut icon" to better change favicon url?
 * if page is launched with bookmark icon, changing favicon colors will change bookmark icon as well;
   however, if bookmark icon is clicked again, icon will reset
 * w3schools.com's favicon is not able to be changed (certain websites?)
*/

/* Storage Explanation
 * groupCount: tracks the number of buttons when adding and deleting buttons
 * buttonCount: tracks the total number of buttons so all buttons can still be accessed even if groupCount is changed
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

	chrome.storage.local.set({"groupCount": 0});
	chrome.storage.local.set({"buttonCount": 0});

	chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Tabs of Current Tab Color"});
	chrome.contextMenus.create({"id": "redFavicon", "title": "Red"});
	chrome.contextMenus.create({"id": "greenFavicon", "title": "Green"});
	chrome.contextMenus.create({"id": "blueFavicon", "title": "Blue"});
	chrome.contextMenus.create({"id": "orangeFavicon", "title": "Orange"});
	chrome.contextMenus.create({"id": "yellowFavicon", "title": "Yellow"});
	chrome.contextMenus.create({"id": "purpleFavicon", "title": "Purple"});

	// launches chrome's extension shortcut tab so user can customize their shortcuts
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

				if (promptUser == "")
				{
					alert("Please enter a name for the tab!");
				}

				// title sent to content script
				chrome.tabs.sendMessage(tabs[0].id, {title: promptUser}, function(response){});
				// saves for persistent title through refresh
				saveTitle[tabs[0].id] = promptUser;
			})
			break;
		/* save tabs of current tab color */
		case "same-color-tabs-toggle-feature":
			sameColorTabs(command);
			break;
	}

	/* context menus */
	switch (command.menuItemId)
	{
		/* save tabs of current tab color */
		case "sameColorTabs":
			sameColorTabs(command)
			break;
		/* change tab color */
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

/* sends messages with command info */
function queryKeys(command)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// sends command to content script
		// selected tab, {command property = command}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {command: command}, function(response) {});
		// sends a message to popup script so sort tabs text field's border color will update from command
		chrome.runtime.sendMessage({msg: "color command"});
	})
}

/* sends message with context menu info to content script */
function queryContextMenu(buttonPress, color)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// selected tab, {button property = context menu pressed, color property = button color}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {button: buttonPress, color: color}, function(response) {});
	})
}

/* save tabs of current tab color */
function sameColorTabs(command)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		var promptUser = prompt("Group name: ");
		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			// enables user to restart process
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
				var tabCount = 0;

				for (; tabCount < tabs.length; tabCount++)
				{
					tabNamesArr[tabCount] = tabs[tabCount].title;
					tabUrlsArr[tabCount] = tabs[tabCount].url;
				}

				/* put everything in getSelected because of asynchronous function not initializing currentFaviconURL before storing */
				// change to query
				chrome.tabs.getSelected(null, function(tab)
				{
					var currentFaviconURL = tab.favIconUrl;

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

					/* initialize object content */
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
					chrome.storage.local.set({"groupCount": (groupCount + 1)});
					// tracks number of buttons so it can display them all even if one is deleted
					chrome.storage.local.set({"buttonCount": (groupCount + 1)});
				})
			})
		}
	})
}

/* store tabs of the same color of the current tab */
function storeSortTabsTextField(storeSortTabsTextField)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		var promptUser = storeSortTabsTextField;
		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			// returns so user can re-enter text into text field
			return;
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

				/* put everything in getSelected because of asynchronous function not initializing currentFaviconURL before storing */
				// looks at color of current tab to determine which tabs should be removed from the color arr (tabs that dont match color)
				// change to query
				chrome.tabs.getSelected(null, function(tab)
				{
					var currentFaviconURL = tab.favIconUrl;

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

					/* initialize object content */
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
					// specified command to have duplicate checked the same way as the sort colors command since sortTabsTextField has the same purpose
					checkDuplicateName(promptUser, groupCount, "same-color-text-field");

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

/* stores all tabs */
function storeAllTabsTextField(storeAllTabsTextField)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		var promptUser = storeAllTabsTextField;
		// limit text so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			// returns so user can re-enter text into text field
			return;
		}
		/* stores the number, name, and urls of the tabs, as well as the group name into an object for storage */
		else
		{
			var groupObject = {};

			/* stores all of the tab's information into an object and then puts object into storage */
			chrome.windows.getAll({populate: true}, function(windows)
			{
				// used to decide storing of a single window or multiple windows
				var singleWindow = false;

				/* checks if saving single window */
				if (windows.length < 2)
				{
					singleWindow = true;
				}

				/* initializing name, url, and color array */
				var tabNamesArr = windows.map(w => w.tabs.map(tab => tab.title));
				var tabUrlsArr = windows.map(w => w.tabs.map(tab => tab.url));
				var tabColorsArr = windows.map(w => w.tabs.map(tab => tab.favIconUrl));

				// stores each window's tab count into an array
				var tabCount = new Array(windows.length);
				var tabCounter = 0;
				var windowCounter = 0;

				/* fills tabCount with a single window's tab number */
				if (singleWindow)
				{
					/* iterates through the tabs in the window */
					windows.forEach(function(tab)
					{
						tabCounter++;
					})
					tabCount[windowCounter] = tabCounter;
					
					windowCounter++;
					// tabCount[1] will contain a flag that there is only a single window stored, with 0 as the flag
					tabCount[windowCounter] = 0;
				}
				/* fills tabCount with several window tab numbers */
				else
				{
					/* iterates through each window */
					windows.forEach(function(window)
					{
						/* iterates through the tabs of the current window */
						window.tabs.forEach(function(tab)
						{
							tabCounter++;
						})
						tabCount[windowCounter] = tabCounter;
						// reset tabCounter for next window
						tabCounter = 0;
						// for storing windows in tabCount
						windowCounter++;
					})
				}

				/* initialize object content */
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
				checkDuplicateName(promptUser, groupCount, "save-all-tabs-text-field");

				/* set-up for next group so last group isn't overwritten */
				// enables empty text to be set
				chrome.storage.local.set({"groupCount": (groupCount + 1)});
				// tracks number of buttons so it can display them all even if one is deleted
				chrome.storage.local.set({"buttonCount": (groupCount + 1)});
			})
		}
	})
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
						/* if button does not launch multiple windows */
						if (command == "same-color-tabs-toggle-feature" || command == "same-color-text-field")
						{
							replaceButton(i, promptUser);
						}
						/* button launches multiple windows */
						else if (command == "save-all-tabs" || command == "save-all-tabs-text-field")
						{
							replaceAllButton(i, promptUser);
						}
						// removes added button from asynchronous function since a button is still added
						chrome.storage.local.remove(["groupName" + groupCount, "tabNames" + groupCount, "tabUrls" + groupCount, "tabColor" + groupCount, "tabCount" + groupCount]);
					}
					else
					{
						alert("Please enter a different name for the group!");
						/* only if command had activated prompt, not the save tabs text field */
						alert("command: " + command);
						if (command != "same-color-text-field" && command != "save-all-tabs-text-field")
						{
							alert("activityTabFeatures");
							ActivityTabFeatures(command);
						}
					}
				}
			// used since asynchronous function would update i before using it; makes for loop work as intended
			}.bind(this, i))
		}
	}
}

/* updates correct COLOR button with tab information AND REPLACES BUTTON */
function replaceButton(replacementButton, promptUser)
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

		/* put everything in getSelected because of asynchronous function not initializing currentFaviconURL before storing */
		// replace with query
		chrome.tabs.getSelected(null, function(tab)
		{
			var currentFaviconURL = tab.favIconUrl;

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
					// decrements tab count as different colored tab is removed
					tabCount--;
					// decrement count since array length changed when tab was deleted ([1, 2, 3] = [1, 3] makes arr[2] = undefined so do i--)
					i--;
				}
			}

			/* initialize object content */
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

		/* button and group counter can be decreased by 1 since return to storeTabsTextField will increment groupCount and buttonCount */
		chrome.storage.local.get(["groupCount", "buttonCount"], function(group2)
		{
			var groupCountMinus1 = group2.groupCount - 1;
			var buttonCountMinus1 = group2.buttonCount - 1;
			chrome.storage.local.set({"groupCount": groupCountMinus1, "buttonCount": buttonCountMinus1});
		})
	})
}

/* updates correct "ALL TABS" button with tab information AND REPLACES BUTTON */
function replaceAllButton(replacementButton, promptUser)
{
	chrome.storage.local.get("groupCount", function(group)
	{
		/* stores the number, name, and urls of the tabs, as well as the group name into an object for storage */
		var groupObject = {};

		/* stores all of the tab's information into an object and then puts object into storage */
		chrome.windows.getAll({populate: true}, function(windows)
		{
			// used to decide storing of a single window or multiple windows */
			var singleWindow = false;

			/* checks if saving single window */
			if (windows.length < 2)
			{
				singleWindow = true;
			}

			/* initializing name, url, and color array */
			var tabNamesArr = windows.map(w => w.tabs.map(tab => tab.title));
			var tabUrlsArr = windows.map(w => w.tabs.map(tab => tab.url));
			var tabColorsArr = windows.map(w => w.tabs.map(tab => tab.favIconUrl));

			// stores each window's tab count into an array
			var tabCount = new Array(windows.length);
			var tabCounter = 0;
			var windowCounter = 0;
			
			/* fills tabCount with a single window's tab number */
			if (singleWindow)
			{
				/* iterates through the tabs in the window */
				windows.forEach(function(tab)
				{
					tabCounter++;
				})
				tabCount[windowCounter] = tabCounter;

				windowCounter++;
				// tabCount[1] will contain a flag that there is only a single window stored, with 0 as the flag
				tabCount[windowCounter] = 0;
			}
			/* fills tabCount with several window tab numbers */
			else
			{
				/* iterates through each window */
				windows.forEach(function(window)
				{
					/* iterates through the tabs of the current window */
					window.tabs.forEach(function(tab)
					{
						tabCounter++;
					})
					tabCount[windowCounter] = tabCounter;
					// reset tabCounter for next window
					tabCounter = 0;
					// for storing windows in tabCount
					windowCounter++;
				})
			}

			/* initialize object content */
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

			/* button and group counter can be decreased by 1 since return to storeAllTabsTextField will increment groupCount and buttonCount */
			chrome.storage.local.get(["groupCount", "buttonCount"], function(group2)
			{
				var decrementedGroupCount = group2.groupCount - 1;
				var decrementedButtonCount = group2.buttonCount - 1;
				chrome.storage.local.set({"groupCount": decrementedGroupCount, "buttonCount": decrementedButtonCount});
			})
			
			// sends a message to popup script so sort tabs text field's border color will update from command
			chrome.runtime.sendMessage({msg: "color command"});
		})
	})
}

// stores title of tab for later use when tab is fully updated
var tabIdsToTitles = {};
// stores color of tab for later use when tab is fully updated
var tabIdsToColor = {};

/* once content script has finished loading in the new tab, send a message with the tab's title to the content script,
   keeps title and color from SAVED tabs persistent through refresh */
// content script would not be able to received message if page has not been loaded
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo)
{
	if (tabIdsToTitles[tabId] && changeInfo.status === "complete")
	{
		chrome.tabs.sendMessage(tabId, {getTitle: tabIdsToTitles[tabId]}, function(response){});
		chrome.tabs.sendMessage(tabId, {getColor: tabIdsToColor[tabId]}, function(response){});
	}
})

// for keeping title through tab refresh 
// (saveTitle is initialized in ActivityTabFeatures(command) under "custom-title-toggle-feature")
var saveTitle = {};
// for keeping color through tab refresh
var saveColor = {};

/* saves the tab's color into saveColor */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
	// looks at current tab
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		// request is the name of the color
		saveColor[tab[0].id] = request;
	})

	sendResponse();
})

/* deletes tab color that is saved in saveColor if color button is pressed;
   if not deleted, asynchronous function calls would make saveColor override color from the button */
function deleteSaveColor(color)
{
	// looks at current tab
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		// only deletes and changes tab color if the tab color is going to change to a different color
		if (saveColor[tab[0].id] != color)
		{
			delete saveColor[tab[0].id];
			// sets saveColor[tab[0].id] to changed color so that the new color is saved
			saveColor[tab[0].id] = color;
		}
	})
}

/* changes tab's title and color after tab refresh if applicable */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	/* title was changed */
	if (saveTitle[tabId] != null)
	{
		// title sent to content script
    	chrome.tabs.sendMessage(tabId, {title: saveTitle[tabId]}, function(response){});
	}

	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		/* sends message to content script if tab is supposed to be colored */
		if (saveColor[tab[0].id] != undefined)
		{
			chrome.tabs.sendMessage(tabId, {color: saveColor[tab[0].id]}, function(response){});
		}
	})
})

/* creates the tabs */
function createTab(group, i, j)
{
	/* creates the tabs */
    chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
    {
		/* saves title of tab */
        var tabTitle = group["tabNames" + i][j];
		tabIdsToTitles[tab.id] = tabTitle;
		/* saves color of tab */
		var tabColor = group["tabColor" + i][j];
		tabIdsToColor[tab.id] = tabColor;
    })
}

/* creates all tabs */
function createAllTabs(group, i, j)
{
	// creates all of the tabs of the current window
	chrome.windows.create({"url": group["tabUrls" + i][j], "state": "maximized"}, function(window)
	{
		/* iterates through the tabs of a window to put tab names and tab color */
		for (var k = 0; k < group["tabUrls" + i][j].length; k++)
		{
			/* saves title of tab */
			var tabTitle = group["tabNames" + i][j][k];
			tabIdsToTitles[window.tabs[k].id] = tabTitle;
			/* saves color of tab */
			var tabColor = group["tabColor" + i][j][k];
			tabIdsToColor[window.tabs[k].id] = tabColor;
		}
	})
}

/* creates the tabs in a new window */
function createWindowTabs(group, i, j)
{
	/* creates a window with the first tab */
	if (j == 0)
	{
		chrome.windows.create({"url": group["tabUrls" + i][j], "state": "maximized"}, function(window)
		{
			// accesses window's array of tabs to access first tab's id
			var firstTabInWindow = window.tabs[0].id;

			/* saves title of tab */
			var tabTitle = group["tabNames" + i][j];
			tabIdsToTitles[firstTabInWindow] = tabTitle;
			/* saves color of tab */
			var tabColor = group["tabColor" + i][j];
			tabIdsToColor[firstTabInWindow] = tabColor;
		})
	}
	else
	{
		/* creates the tabs */
		chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
		{
			/* saves title of tab */
			var tabTitle = group["tabNames" + i][j];
			tabIdsToTitles[tab.id] = tabTitle;
			/* saves color of tab */
			var tabColor = group["tabColor" + i][j];
			tabIdsToColor[tab.id] = tabColor;
			// console.log("set tabIdsToColor[tab.id]: " + tabIdsToColor[tab.id]);
		})
	}
}