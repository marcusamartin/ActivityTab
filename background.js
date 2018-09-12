/* FIXME:
 * buttonCount is inefficient, fix by using an array of object and .length
 * might want to change sameSortTextField to get colored tabs from all windows like saveAllTabs
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
	/* checks to see if objectArr already exists (for update purposes) */
	chrome.storage.local.get("objectArr", function(group)
	{
		if (group.objectArr == undefined)
		{
			// objectArr will store the group objects and will allow the popup buttons to be displayed exactly
			var objectArr = [];
			chrome.storage.local.set({"objectArr": objectArr});
		}
	})

	/* prints everything in storage */
	// chrome.storage.local.get(null, function(items) 
	// {
	// 	var allKeys = Object.keys(items);
	// 	console.log("storage: " + allKeys);
	// })

	chrome.contextMenus.create({"id": "renameTab", "title": "Rename the Tab"});
	chrome.contextMenus.create({"id": "redFavicon", "title": "Red"});
	chrome.contextMenus.create({"id": "greenFavicon", "title": "Green"});
	chrome.contextMenus.create({"id": "blueFavicon", "title": "Blue"});
	chrome.contextMenus.create({"id": "orangeFavicon", "title": "Orange"});
	chrome.contextMenus.create({"id": "yellowFavicon", "title": "Yellow"});
	chrome.contextMenus.create({"id": "purpleFavicon", "title": "Purple"});
	// only created on tabs that are colored
	// chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Tabs of Current Tab Color"});
	chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});

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
	switch (command)
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
			renameTab();
			break;
		/* save tabs of current tab color */
		case "same-color-tabs-toggle-feature":
			sameColorTabs(command);
			break;
	}

	/* context menus */
	switch (command.menuItemId)
	{
		case "renameTab":
			renameTab();
			break;
		/* change tab color */
		case "redFavicon":
			// updates "sameColorTabs" context menu if "Red" context menu is clicked
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Red Tabs"});
			queryContextMenu("buttonPress", "red");
			break;
		case "greenFavicon":
			// updates "sameColorTabs" context menu if "Green" context menu is clicked
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Green Tabs"});
			queryContextMenu("buttonPress", "green");
			break;
		case "blueFavicon":
			// updates "sameColorTabs" context menu if "Blue" context menu is clicked
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Blue Tabs"});
			queryContextMenu("buttonPress", "blue");
			break;
		case "yellowFavicon":
			// updates "sameColorTabs" context menu if "Yellow" context menu is clicked
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Yellow Tabs"});
			queryContextMenu("buttonPress", "yellow");
			break;
		case "orangeFavicon":
			// updates "sameColorTabs" context menu if "Orange" context menu is clicked
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Orange Tabs"});
			queryContextMenu("buttonPress", "orange");
			break;
		case "purpleFavicon":
			// updates "sameColorTabs" context menu if "Purple" context menu is clicked
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Purple Tabs"});
			queryContextMenu("buttonPress", "purple");
			break;
		/* save tabs of current tab color */
		case "sameColorTabs":
			sameColorTabs(command)
			break;
		case "allTabs":
			allTabs(command);
			break;
	}
}

/* gets title from prompt and renames tab */
function renameTab()
{
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) 
	{
		var promptUser = prompt("Rename the tab:");

		if (promptUser == "")
		{
			alert("Please enter a name for the tab!");
			renameTab();
		}

		// title sent to content script
		chrome.tabs.sendMessage(tabs[0].id, {title: promptUser}, function(response){});
		// saves for persistent title through refresh
		saveTitle[tabs[0].id] = promptUser;
	})
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
	chrome.storage.local.get("objectArr", function(group)
	{
		var promptUser = prompt("Group name: ");
		// text limit so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			/* enables user to restart process */
			// for context menu
			if (command.menuItemId != null)
			{
				sameColorTabs(command.menuItemId);
			}
			// for command
			else
			{
				sameColorTabs(command);
			}
		}
		/* stores the number, name, and urls of the tabs, as well as the group name into an object for storage */
		else
		{
			var groupObject = {};

			/* stores all of the tab's information into an object and then puts object into storage */
			chrome.tabs.query({}, function(tabs)
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

				/* put everything in query because of asynchronous function not initializing currentFaviconURL before storing */
				chrome.tabs.query({active: true}, function(tab)
				{
					var currentFaviconURL = tab[0].favIconUrl;

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
					var groupName = "groupName";
					groupObject[groupName] = promptUser;

					var tabNames = "tabNames";
					groupObject[tabNames] = tabNamesArr;

					var tabUrls = "tabUrls";
					groupObject[tabUrls] = tabUrlsArr;

					var tabColor = "tabColor";
					groupObject[tabColor] = tabColorsArr;

					var tabCount2 = "tabCount";
					groupObject[tabCount2] = tabCount;


					group.objectArr.push(groupObject);
					var objectArr = group.objectArr;

					// updates storage with new objectArr with groupObject
					chrome.storage.local.set({"objectArr": objectArr});

					/* checks if duplicate name */
					checkDuplicateName(promptUser, objectArr, command);
				})
			})
		}
	})
}

/* store tabs of the same color of the current tab */
function storeSortTabsTextField(storeSortTabsTextField)
{
	chrome.storage.local.get("objectArr", function(group)
	{
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
			chrome.tabs.query({}, function(tabs)
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

				/* put everything in query because of asynchronous function not initializing currentFaviconURL before storing */
				// looks at color of current tab to determine which tabs should be removed from the color arr (tabs that dont match color)
				chrome.tabs.query({active: true}, function(tab)
				{
					var currentFaviconURL = tab[0].favIconUrl;

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
					var groupName = "groupName";
					groupObject[groupName] = promptUser;

					var tabNames = "tabNames";
					groupObject[tabNames] = tabNamesArr;

					var tabUrls = "tabUrls";
					groupObject[tabUrls] = tabUrlsArr;

					var tabColor = "tabColor";
					groupObject[tabColor] = tabColorsArr;

					var tabCount2 = "tabCount";
					groupObject[tabCount2] = tabCount;

					group.objectArr.push(groupObject);
					var objectArr = group.objectArr;

					// updates storage with new objectArr with groupObject
					chrome.storage.local.set({"objectArr": objectArr});

					/* checks if duplicate name */
					// specified command to have duplicate checked the same way as the sort colors command since sortTabsTextField has the same purpose
					checkDuplicateName(promptUser, objectArr, "same-color-text-field");
				})
			})
		}
	})
}

/* responds to context menu for save all tabs */
function allTabs(command)
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var promptUser = prompt("Group name: ");
		// limit text so the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			/* returns so user can re-enter text into text field */
			// for context menu
			if (command.menuItemId != null)
			{
				allTabs(command.menuItemId);
			}
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
				var groupName = "groupName";
				groupObject[groupName] = promptUser;

				var tabNames = "tabNames";
				groupObject[tabNames] = tabNamesArr;

				var tabUrls = "tabUrls";
				groupObject[tabUrls] = tabUrlsArr;

				var tabColor = "tabColor";
				groupObject[tabColor] = tabColorsArr;

				var tabCount2 = "tabCount";
				groupObject[tabCount2] = tabCount;

				group.objectArr.push(groupObject);
				var objectArr = group.objectArr;

				// updates storage with new objectArr with groupObject
				chrome.storage.local.set({"objectArr": objectArr});

				/* checks if duplicate name */
				// specified command to have duplicate checked the same way as the sort colors command
				checkDuplicateName(promptUser, objectArr, command);
			})
		}
	})
}

/* stores all tabs */
function storeAllTabsTextField(storeAllTabsTextField)
{
	chrome.storage.local.get("objectArr", function(group)
	{
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
				var groupName = "groupName";
				groupObject[groupName] = promptUser;

				var tabNames = "tabNames";
				groupObject[tabNames] = tabNamesArr;

				var tabUrls = "tabUrls";
				groupObject[tabUrls] = tabUrlsArr;

				var tabColor = "tabColor";
				groupObject[tabColor] = tabColorsArr;

				var tabCount2 = "tabCount";
				groupObject[tabCount2] = tabCount;

				group.objectArr.push(groupObject);
				var objectArr = group.objectArr;

				// updates storage with new objectArr with groupObject
				chrome.storage.local.set({"objectArr": objectArr});

				/* checks if duplicate name */
				// specified command to have duplicate checked the same way as the sort colors command
				checkDuplicateName(promptUser, objectArr, "save-all-tabs-text-field");
			})
		}
	})
}

/* checks if there is a duplicate name and then removes the button at the end that is still
   added because of the first ~asynchronous~ function in sameColorTabs() and storeTabsTextField() */
   // FIXME: groupCount
function checkDuplicateName(promptUser, objectArr, command)
{
	// if (promptUser != "" && groupCount != 0)
	if (promptUser != "" && objectArr.length != 1)
	{
		/* iterates through the buttons */
		// added "- 1" because button is already populated and it is catching it as a duplicate when it is just the same button
		for (var i = 0; i < objectArr.length - 1; i++)
		{
			// chrome.storage.local.get(["groupName" + i, "tabCount" + i], function(i, anotherGroup)
			chrome.storage.local.get("objectArr", function(i, anotherGroup)
			{
				// var groupName = anotherGroup["groupName" + i];
				var groupName = anotherGroup.objectArr[i]["groupName"];
					
				if (groupName == promptUser)
				{
					alert("Duplicate name!");
					var duplicatePrompt = confirm("Would you like to replace the group?");

					if (duplicatePrompt)
					{
						/* if button does not launch multiple windows */
						if (command == "same-color-tabs-toggle-feature" || command == "same-color-text-field" || command.menuItemId == "sameColorTabs")
						// if (command != "save-all-tabs" && command != "save-all-tabs-text-field")
						{
							replaceButton(i, promptUser);
						}
						/* button launches multiple windows */
						else if (command == "save-all-tabs" || command == "save-all-tabs-text-field" || command.menuItemId == "allTabs")
						{
							replaceAllButton(i, promptUser);
						}
						// removes added button from asynchronous function since a button is still added
						// chrome.storage.local.remove(["groupName" + groupCount, "tabNames" + groupCount, "tabUrls" + groupCount, "tabColor" + groupCount, "tabCount" + groupCount]);
					}
					else
					{
						alert("Please enter a different name for the group!");
						// removes added button from asynchronous function since a button is still added
						// chrome.storage.local.remove(["groupName" + groupCount, "tabNames" + groupCount, "tabUrls" + groupCount, "tabColor" + groupCount, "tabCount" + groupCount]);
						anotherGroup.objectArr.splice(anotherGroup.objectArr.length - 1, 1);
						var objectArr = anotherGroup.objectArr;
						chrome.storage.local.set({"objectArr": objectArr});

						/* only if command had activated prompt, not the text fields */
						if (command != "same-color-text-field" && command != "save-all-tabs-text-field")
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

/* updates correct COLOR button with tab information AND REPLACES BUTTON */
function replaceButton(replacementButton, promptUser)
{
	chrome.storage.local.get("objectArr", function(group)
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
	
			/* put everything in query because of asynchronous function not initializing currentFaviconURL before storing */
			chrome.tabs.query({active: true}, function(tab)
			{
				var currentFaviconURL = tab[0].favIconUrl;
	
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
				var groupName = "groupName";
				groupObject[groupName] = promptUser;
	
				var tabNames = "tabNames";
				groupObject[tabNames] = tabNamesArr;
	
				var tabUrls = "tabUrls";
				groupObject[tabUrls] = tabUrlsArr;
	
				var tabColor = "tabColor";
				groupObject[tabColor] = tabColorsArr;
	
				var tabCount2 = "tabCount";
				groupObject[tabCount2] = tabCount;
				
				// replacement button updated with new tab information
				group.objectArr.splice(replacementButton, 0, groupObject);
				// removes added button right after replacement button (caused by asynchronous function)
				group.objectArr.splice(replacementButton + 1, 1);
				// removes added button from end (caused by asynchronous function)
				group.objectArr.splice(group.objectArr.length - 1, 1);
				var objectArr = group.objectArr;
				// updates storage with new objectArr with groupObject
				chrome.storage.local.set({"objectArr": objectArr});

				// refresh popup so added duplicate button is not displayed (caused by asynchronous function)
				chrome.runtime.sendMessage({msg: "color command"});
			})
		})
	})
}

/* updates correct "ALL TABS" button with tab information AND REPLACES BUTTON */
function replaceAllButton(replacementButton, promptUser)
{
	chrome.storage.local.get("objectArr", function(group)
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
			var groupName = "groupName";
			groupObject[groupName] = promptUser;

			var tabNames = "tabNames";
			groupObject[tabNames] = tabNamesArr;

			var tabUrls = "tabUrls";
			groupObject[tabUrls] = tabUrlsArr;

			var tabColor = "tabColor";
			groupObject[tabColor] = tabColorsArr;

			var tabCount2 = "tabCount";
			groupObject[tabCount2] = tabCount;

			// replacement button updated with new tab information
			group.objectArr.splice(replacementButton, 0, groupObject);
			// removes added button right after replacement button (caused by asynchronous function)
			group.objectArr.splice(replacementButton + 1, 1);
			// removes added button from end (caused by asynchronous function)
			group.objectArr.splice(group.objectArr.length - 1, 1);
			var objectArr = group.objectArr;
			// updates storage with new objectArr with groupObject
			chrome.storage.local.set({"objectArr": objectArr});
			
			// sends a message to popup script so sort tabs text field's border color will update from command
			chrome.runtime.sendMessage({msg: "color command"});
		})
	})
}

// stores title of tab for later use when tab is fully updated
var tabIdsToTitles = {};
// stores color of tab for later use when tab is fully updated
var tabIdsToColor = {};

// for keeping title through tab refresh 
// (saveTitle is initialized in ActivityTabFeatures(command) under "custom-title-toggle-feature")
var saveTitle = {};
// for keeping color through tab refresh
var saveColor = {};

/* saves color and title of tab to keep them through tab refresh */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	// alert("onmessage");
	// alert("request: " + request);
	// alert("request.msg: " + request.msg);
	// looks at current tab
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		// request is the name of the color, saved into saveColor
		saveColor[tab[0].id] = request;
		// tab title from text field sent to be saved into saveTitle
		if (request.name)
		{
			saveTitle[tab[0].id] = request.name;
		}
	})

	/* updates "sameColorTabs" context menu command that changes color is used */
	switch (request)
	{
		case "red":
			// remove "allTabs" context menu so it can be recreated under "Save Red Tabs" context menu (aesthetic reason)
			chrome.contextMenus.remove("allTabs");
			// remove "sameColorTabs" context menu since you cannot create a duplicate context menu if it already exists
			chrome.contextMenus.remove("sameColorTabs");
			// create "saveColorTabs" context menu since tab is colored
			chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Red Tabs"});
			// recreate  "allTabs" context menu
			chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});
			break;
		case "green":
			chrome.contextMenus.remove("allTabs");
			chrome.contextMenus.remove("sameColorTabs");
			chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Green Tabs"});
			chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});
			break;
		case "blue":
			chrome.contextMenus.remove("allTabs");
			chrome.contextMenus.remove("sameColorTabs");
			chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Blue Tabs"});
			chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});
			break;
		case "yellow":
			chrome.contextMenus.remove("allTabs");
			chrome.contextMenus.remove("sameColorTabs");
			chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Yellow Tabs"});
			chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});
			break;
		case "orange":
			chrome.contextMenus.remove("allTabs");
			chrome.contextMenus.remove("sameColorTabs");
			chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Orange Tabs"});
			chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});
			break;
		case "purple":
			chrome.contextMenus.remove("allTabs");
			chrome.contextMenus.remove("sameColorTabs");
			chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Purple Tabs"});
			chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});
			break;
		default:
			break;
	}

	sendResponse();
})

/* removes color and title from saveColor and saveTitle once tab is closed */
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo)
{
	delete saveColor[tabId];
	delete saveTitle[tabId];
})

/* deletes tab color that is saved in saveColor if color button is pressed;
   if not deleted, asynchronous function calls would make saveColor override color from the button */
// might not be necessary? keeping just in case
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
	/* changes tab's title and color after tab refresh if applicable */
	if (tabIdsToTitles[tabId] && changeInfo.status === "complete")
	{
		chrome.tabs.sendMessage(tabId, {getTitle: tabIdsToTitles[tabId]}, function(response){});
		chrome.tabs.sendMessage(tabId, {getColor: tabIdsToColor[tabId]}, function(response){});
	}

	//--------------------------------------------------------------------------------------------------------------------------------------------------------
	/* once content script has finished loading in the new tab, send a message with the tab's title and color to the content script,
       keeps title and color from SAVED tabs persistent through refresh */
	// content script would not be able to received message if page has not been loaded

	/* title was changed */
	if (saveTitle[tabId] != null)
	{
		// title sent to content script
		chrome.tabs.sendMessage(tabId, {title: saveTitle[tabId]}, function(response){});
	}

	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		/* sends message to content script if tab is supposed to be colored; tabId is checked so that if tab is being launched by groupButton, 
		   the tab being launched will not be set to the color of the current active tab */
		if (saveColor[tab[0].id] != undefined && tab[0].id == tabId)
		{
			chrome.tabs.sendMessage(tabId, {color: saveColor[tab[0].id]}, function(response){});
		}
	})
	//--------------------------------------------------------------------------------------------------------------------------------------------------------
})

/* creates the tabs */
function createTab(group, i, j)
{
	/* creates the tabs */
	// chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
	chrome.tabs.create({"url": group.objectArr[i]["tabUrls"][j], "active": false}, function(tab)
    {
		/* saves title of tab */
		// var tabTitle = group["tabNames" + i][j];
		var tabTitle = group.objectArr[i]["tabNames"][j];
		tabIdsToTitles[tab.id] = tabTitle;
		/* saves color of tab */
		// var tabColor = group["tabColor" + i][j];
		var tabColor = group.objectArr[i]["tabColor"][j];
		tabIdsToColor[tab.id] = tabColor;
    })
}

/* creates all tabs */
function createAllTabs(group, i, j)
{
	// creates all of the tabs of the current window
	// chrome.windows.create({"url": group["tabUrls" + i][j], "state": "maximized"}, function(window)
	chrome.windows.create({"url": group.objectArr[i]["tabUrls"][j], "state": "maximized"}, function(window)
	{
		/* iterates through the tabs of a window to put tab names and tab color */
		// for (var k = 0; k < group["tabUrls" + i][j].length; k++)
		for (var k = 0; k < group.objectArr[i]["tabUrls"][j].length; k++)
		{
			/* saves title of tab */
			// var tabTitle = group["tabNames" + i][j][k];
			var tabTitle = group.objectArr[i]["tabNames"][j][k];
			tabIdsToTitles[window.tabs[k].id] = tabTitle;
			/* saves color of tab */
			// var tabColor = group["tabColor" + i][j][k];
			var tabColor = group.objectArr[i]["tabColor"][j][k];
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
		// chrome.windows.create({"url": group["tabUrls" + i][j], "state": "maximized"}, function(window)
		chrome.windows.create({"url": group.objectArr[i]["tabUrls"][j], "state": "maximized"}, function(window)
		{
			// accesses window's array of tabs to access first tab's id
			var firstTabInWindow = window.tabs[0].id;

			/* saves title of tab */
			// var tabTitle = group["tabNames" + i][j];
			var tabTitle = group.objectArr[i]["tabNames"][j];
			tabIdsToTitles[firstTabInWindow] = tabTitle;
			/* saves color of tab */
			// var tabColor = group["tabColor" + i][j];
			var tabColor = group.objectArr[i]["tabColor"][j];
			tabIdsToColor[firstTabInWindow] = tabColor;
		})
	}
	else
	{
		/* creates the tabs */
		// chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false}, function(tab)
		chrome.tabs.create({"url": group.objectArr[i]["tabUrls"][j], "active": false}, function(tab)
		{
			/* saves title of tab */
			// var tabTitle = group["tabNames" + i][j];
			var tabTitle = group.objectArr[i]["tabNames"][j];
			tabIdsToTitles[tab.id] = tabTitle;
			/* saves color of tab */
			// var tabColor = group["tabColor" + i][j];
			var tabColor = group.objectArr[i]["tabColor"][j];
			tabIdsToColor[tab.id] = tabColor;
		})
	}
}

/* changes the sort colors context menu text to reflect the color of the current tab */
chrome.tabs.onActivated.addListener(function(activeInfo)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
	{
		chrome.tabs.sendMessage(tabs[0].id, {"changeContextMenu": "changeContextMenu"}, function(response){});
	})
})