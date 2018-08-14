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

	chrome.contextMenus.create({"id": "saveTabs", "title": "Save the Tabs"});
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
		/* save tabs */
		case "lasttab-toggle-feature":
			storeTabs();
			break;
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
	}

	/* context menus */
	switch (command.menuItemId)
	{
		case "saveTabs":
			storeTabs();
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

/* puts current window's tabs into storage */
function storeTabs()
{
	chrome.storage.local.get("groupCount", function(group)
	{
		// current count of groups
		var groupCount = group.groupCount;

		var promptUser = prompt("Group name: ");

		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if duplicate name */   // FIXME: NOT WORKING
		if (promptUser != "" && groupCount != 0)
		{
			/* iterates through the buttons */
			for (var i = 0; i < groupCount; i++)
			{
				chrome.storage.local.get(["groupName" + i], function(anotherGroup) // cannot refer to groupName with i, only with numbers (ex: 1)
				{
					var groupName = anotherGroup["groupName" + i];   // with 0 duplicate name is caught
					console.log("group: " + anotherGroup["groupName" + i]);

					chrome.storage.local.get(null, function(items)
					{
						var allKeys = Object.keys(items);
						console.log("storage: " + allKeys);
					})
					// console.log("groupName: " + groupName);   // somehow does not erase storage completely

					if (groupName == promptUser)
					{
						alert("Duplicate name!");
						var duplicatePrompt = prompt("Would you like to replace the group?");

						if (duplicatePrompt)
						{
							alert("replaceButton");
							//replaceButton(groupCount);
						}
					}
				})
			}
		}

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			ActivityTabFeatures(command);
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
				var tabCount = 0;

				for (; tabCount < tabs.length; tabCount++)
				{
					tabNamesArr[tabCount] = tabs[tabCount].title;
					// console.log("title of tab: " + tabs[tabCount].title);
					tabUrlsArr[tabCount] = tabs[tabCount].url;
				}

				var groupName = "groupName" + groupCount;
				groupObject[groupName] = promptUser;

				var tabNames = "tabNames" + groupCount;
				groupObject[tabNames] = tabNamesArr;

				var tabUrls = "tabUrls" + groupCount;
				groupObject[tabUrls] = tabUrlsArr;

				var tabCount2 = "tabCount" + groupCount;
				groupObject[tabCount2] = tabCount;

				// puts object into storage
				chrome.storage.local.set(groupObject);

				// set-up for next group so last group isn't overwritten
				chrome.storage.local.set({"groupCount": (groupCount + 1)});   // enables empty text to be set
				chrome.storage.local.set({"buttonCount": (groupCount + 1)});   // tracks number of buttons so it can display them all even if one is deleted
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

		var promptUser =  storeTabsTextField;

		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if duplicate name */   // NOT WORKING
		// if (promptUser != "")
		// {
		// 	chrome.storage.local.get("groupCount", function(group)
		// 	{
		// 		groupCount = group.groupCount;
				
		// 		var i = 0;
		// 		/* iterates through the buttons */
		// 		for (; i < groupCount; i++)
		// 		{
		// 			chrome.storage.local.get("groupName", function(anotherGroup)
		// 			{
		// 				alert("groupName: " + anotherGroup["groupName" + i]);   // groupName is undefined
		// 				var groupName = anotherGroup["groupName" + i];

		// 				if (promptUser == groupName)
		// 				{
		// 					alert("Duplicate name of an existing group!");
		// 					ActivityTabFeatures();
		// 				}
		// 			})
		// 		}
		// 	})
		// }

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
				var tabCount = 0;

				for (; tabCount < tabs.length; tabCount++)
				{
					tabNamesArr[tabCount] = tabs[tabCount].title;
					// console.log("title of tab: " + tabs[tabCount].title);
					tabUrlsArr[tabCount] = tabs[tabCount].url;
				}

				var groupName = "groupName" + groupCount;
				groupObject[groupName] = promptUser;

				var tabNames = "tabNames" + groupCount;
				groupObject[tabNames] = tabNamesArr;

				var tabUrls = "tabUrls" + groupCount;
				groupObject[tabUrls] = tabUrlsArr;

				var tabCount2 = "tabCount" + groupCount;
				groupObject[tabCount2] = tabCount;

				// puts object into storage
				chrome.storage.local.set(groupObject);

				// set-up for next group so last group isn't overwritten
				chrome.storage.local.set({"groupCount": (groupCount + 1)});   // enables empty text to be set
				chrome.storage.local.set({"buttonCount": (groupCount + 1)});   // tracks number of buttons so it can display them all even if one is deleted
			})
		}
	})
}

/* stores title of tab for later use when tab is fully updated */
var tabIdsToTitles = {};

/* creates the tabs */
function createTab(group, i, j)
{
    chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
    {
        var tabTitle = group["tabNames" + i][j];
        tabIdsToTitles[tab.id] = tabTitle;
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