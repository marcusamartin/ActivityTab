/* FIXME:
 * if page is launched with bookmark icon, changing favicon colors will change bookmark icon as well;
   regular icon can be set by launching uncolored tab and then clicking bookmark icon
*/

/* Storage Explanation
 * groupName: name of the button given by the user
 * tabNames: names of the tabs
 * tabUrls: urls of the tabs
 * tabCount: number of tabs in the window
*/

// opens shortcut url upon extension installation
chrome.runtime.onInstalled.addListener(onInstall);

/* runs on installation/update of extension */
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

	/* initializing context menus */
	// retitle the tab
	chrome.contextMenus.create({"id": "renameTab", "title": "Rename the Tab"});
	// color the tab
	chrome.contextMenus.create({"id": "redFavicon", "title": "Red"});
	chrome.contextMenus.create({"id": "greenFavicon", "title": "Green"});
	chrome.contextMenus.create({"id": "blueFavicon", "title": "Blue"});
	chrome.contextMenus.create({"id": "orangeFavicon", "title": "Orange"});
	chrome.contextMenus.create({"id": "yellowFavicon", "title": "Yellow"});
	chrome.contextMenus.create({"id": "purpleFavicon", "title": "Purple"});
	// saves all of the same colored tabs of the current colored tab (only created on tabs that are colored)
	// chrome.contextMenus.create({"id": "sameColorTabs", "title": "Save Tabs of Current Tab Color"});
	// saves all of the tabs
	chrome.contextMenus.create({"id": "allTabs", "title": "Save All Tabs"});

	// launches chrome's extension shortcut tab so user can customize their shortcuts
    // chrome.tabs.create({url: "chrome://extensions/shortcuts"});
}


// when command is executed, determine which command was executed
chrome.commands.onCommand.addListener(ActivityTabFeatures);

// when context menu is clicked, determine which context menu was clicked
chrome.contextMenus.onClicked.addListener(ActivityTabFeatures);

/* executes actions for the commands and context menus */
function ActivityTabFeatures(command)
{
	/* commands */
	switch (command)
	{
		/* left arrow key changes the tab's color */
		case "left-key-toggle-feature":
			queryKeys("left-key-toggle-feature");
			break;
		/* right arrow key changes the tab's color */
		case "right-key-toggle-feature":
			queryKeys("right-key-toggle-feature");
			break;
		/* up arrow key retitles the tab */
		case "custom-title-toggle-feature":
			renameTab();
			break;
		/* down arrow key saves all of the same colored tabs of the current colored tab */
		case "same-color-tabs-toggle-feature":
			/* checks if the tab is colored */
			chrome.tabs.query({active: true, currentWindow: true}, function(tab)
			{
				var isColored = checkTabColor(tab);

				if (isColored)
				{
					sameColorTabs(command);
				}
				else
				{
					alert("Cannot save the tab! The tab is not colored.");
				}
			})
			break;
	}

	/* context menus */
	switch (command.menuItemId)
	{
		/* retitles the tab */
		case "renameTab":
			renameTab();
			break;
		/* updates "save [COLOR] tabs" context menu if "[COLOR]" context menu is clicked */
		case "redFavicon":
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Red Tabs"});
			queryContextMenu("buttonPress", "red");
			break;
		case "greenFavicon":
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Green Tabs"});
			queryContextMenu("buttonPress", "green");
			break;
		case "blueFavicon":
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Blue Tabs"});
			queryContextMenu("buttonPress", "blue");
			break;
		case "yellowFavicon":
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Yellow Tabs"});
			queryContextMenu("buttonPress", "yellow");
			break;
		case "orangeFavicon":
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Orange Tabs"});
			queryContextMenu("buttonPress", "orange");
			break;
		case "purpleFavicon":
			chrome.contextMenus.update("sameColorTabs", {"title": "Save Purple Tabs"});
			queryContextMenu("buttonPress", "purple");
			break;
		/* saves all of the same colored tabs of the current colored tab */
		case "sameColorTabs":
			sameColorTabs(command)
			break;
		/* saves all of the tabs */
		case "allTabs":
			allTabs(command);
			break;
	}
}

/* prompts the user and gets the text to retitle the tab (from a command or a context menu) */
function renameTab()
{
	// gets information about the current tab
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
	{
		var promptUser = prompt("Rename the tab:");

		if (promptUser == "")
		{
			alert("Please enter a name for the tab!");
			renameTab();
		}
		else if (promptUser)
		{
			// title is sent to the content script for the tab to be retitled (current tab's id, user text, response for error message (not needed))
			chrome.tabs.sendMessage(tabs[0].id, {title: promptUser}, function(response){});
			// saves the title so that the tab's title can persist through a refresh
			saveTitle[tabs[0].id] = promptUser;
		}
	})
}

/* sends a message to the content script to color the tab(s) (from a command) */
function queryKeys(command)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tab)
	{
		chrome.tabs.sendMessage(tab[0].id, {command: command, tabid: tab[0].id}, function(response) {});
		chrome.runtime.sendMessage({msg: "reload popup"});
	})
}

/* sends a message to the content script to color the tabs (from a context menu) */
function queryContextMenu(buttonPress, color)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tab)
	{
		// send the current tab's id, identifier (as the context menu acts the same as the buttons in the popup),
		// and the color corresponding to the context menu; response for error message (not needed)
		chrome.tabs.sendMessage(tab[0].id, {button: buttonPress, contextMenuColor: color, tabid: tab[0].id}, function(response) {});
	})
}

/* returns false if tab is not colored and true if tab is colored */
function checkTabColor(tab)
{
	// current tab favicon
	var currentFaviconURL = tab[0].favIconUrl;
	/* urls of color favicons */
	var redURL = chrome.runtime.getURL("img/red_circle_16.png");
	var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
	var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
	var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
	var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

	if (currentFaviconURL != redURL && currentFaviconURL != greenURL && currentFaviconURL != blueURL &&
		currentFaviconURL != yellowURL && currentFaviconURL != orangeURL && currentFaviconURL != purpleURL)
	{
		return false;
	}
	else
	{
		return true;
	}
}

/* save tabs of the current tab's color (from the command) */
function sameColorTabs(command)
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var promptUser = prompt("Group name: ");
		// limit the text so that the text fits in the button
		promptUser = promptUser.substr(0, 26);

		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			/* enables user to restart process */
			// restarts context menu process (same as command process but uses .menuItemId to access the command)
			if (command.menuItemId != null)
			{
				sameColorTabs(command.menuItemId);
			}
			// restarts command process
			else
			{
				sameColorTabs(command);
			}
		}
		/* stores the group name and the names, urls, and colors of the tabs into an object for storage */
		else
		{
			var groupObject = {};

			// gets information from all of the tabs
			chrome.tabs.query({}, function(tabs)
			{
				/* gets each tab's name, url, and color from an array of tabs and stores them into arrays */
				var tabNamesArr = [];
				var tabUrlsArr = [];
				// var tabNamesArr = tabs.map(t => t.title);
				// var tabUrlsArr = tabs.map(t => t.url);
				var tabColorsArr = tabs.map(t => t.favIconUrl);
				var tabCount = 0;

				for (; tabCount < tabs.length; tabCount++)
				{
					tabNamesArr[tabCount] = tabs[tabCount].title;
					tabUrlsArr[tabCount] = tabs[tabCount].url;
				}

				/* put everything in query because of how the asynchronous function does not initializing currentFaviconURL before storing the object */
				// looks at color of current tab to determine which tabs should be removed from the color arr (tabs that dont match color)
				chrome.tabs.query({active: true, currentWindow: true}, function(tab)
				{
					var currentFaviconURL = tab[0].favIconUrl;

					/* removes favicon urls that are not "colored" urls from tab colors array */
					for (var i = 0; i < tabColorsArr.length; i++)
					{
						if (tabColorsArr[i] != currentFaviconURL)
						{
							tabColorsArr.splice(i, 1);
							// removes name of array
							tabNamesArr.splice(i, 1);
							// removes url of array
							tabUrlsArr.splice(i, 1);
							// decrements tab count as tab is removed
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

					// updates storage with new objectArr
					chrome.storage.local.set({"objectArr": objectArr});

					/* checks if duplicate name */
					checkDuplicateName(promptUser, objectArr, command);

					// refreshes popup if command was used when popup is active
					if (command)
					{
						// refresh popup so added button is displayed
						chrome.runtime.sendMessage({msg: "reload popup"});
					}
				})
			})
		}
	})
}

/* store tabs of the same color of the current tab (from the text field) */
function storeSortTabsTextField(storeSortTabsTextField)
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var promptUser = storeSortTabsTextField;
		// limit the text so that the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			// returns so user can re-enter text into text field
			return;
		}
		/* stores all of the information from the tabs into an object and then puts object into storage */
		else
		{
			var groupObject = {};

			// gets information from all of the tabs
			chrome.tabs.query({}, function(tabs)
			{
				/* gets each tab's name, url, and color from an array of tabs and stores them into arrays */
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
				chrome.tabs.query({active: true, currentWindow: true}, function(tab)
				{
					var currentFaviconURL = tab[0].favIconUrl;

					/* removes favicon urls that are not colored from tab colors array */
					for (var i = 0; i < tabColorsArr.length; i++)
					{
						if (tabColorsArr[i] != currentFaviconURL)
						{
							tabColorsArr.splice(i, 1);
							// removes name of array
							tabNamesArr.splice(i, 1);
							// removes url of array
							tabUrlsArr.splice(i, 1);
							// decrements tab count as tab is removed
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

					// updates storage with new objectArr
					chrome.storage.local.set({"objectArr": objectArr});

					/* checks if duplicate name */
					// specified command to have duplicate checked the same way as the sort colors command since sortTabsTextField has the same purpose
					checkDuplicateName(promptUser, objectArr, "same-color-text-field");
				})
			})
		}
	})
}

/* saves all of the tabs (from the context menu) */
function allTabs(command)
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var promptUser = prompt("Group name: ");
		// limit the text so that the text can fit in the button
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
		/* stores the group name and the names, urls, and colors of the tabs into an object for storage */
		else
		{
			var groupObject = {};

			/* stores information from all of the tabs into an object and then puts object into storage */
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

/* stores all of the tabs (from the text field) */
function storeAllTabsTextField(storeAllTabsTextField)
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var promptUser = storeAllTabsTextField;
		// limit the text so that the text can fit in the button
		promptUser = promptUser.substr(0, 26);

		/* checks if name is invalid */
		if (promptUser == "")
		{
			alert("Please enter a name for the group!");
			// returns so user can re-enter text into text field
			return;
		}
		/* stores the group name and the names, urls, and colors of the tabs into an object for storage */
		else
		{
			var groupObject = {};

			/* stores information from all of the tabs into an object and then puts object into storage */
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
function checkDuplicateName(promptUser, objectArr, command)
{
	if (promptUser != "" && objectArr.length != 1)
	{
		/* iterates through the buttons */
		// decremented objectArr's length because the button is already populated; the function is catching the button as a duplicate when it is the button that was just added
		for (var i = 0; i < objectArr.length - 1; i++)
		{
			chrome.storage.local.get("objectArr", function(i, anotherGroup)
			{
				var groupName = anotherGroup.objectArr[i]["groupName"];
					
				if (groupName == promptUser)
				{
					alert("Duplicate name!");
					var duplicatePrompt = confirm("Would you like to replace the group?");

					if (duplicatePrompt)
					{
						/* if button does not launch multiple windows */
						if (command == "same-color-tabs-toggle-feature" || command == "same-color-text-field" || command.menuItemId == "sameColorTabs")
						{
							replaceButton(i, promptUser);
						}
						/* button launches multiple windows */
						else if (command == "save-all-tabs" || command == "save-all-tabs-text-field" || command.menuItemId == "allTabs")
						{
							replaceAllButton(i, promptUser);
						}
					}
					else
					{
						alert("Please enter a different name for the group!");
						anotherGroup.objectArr.splice(anotherGroup.objectArr.length - 1, 1);
						var objectArr = anotherGroup.objectArr;
						chrome.storage.local.set({"objectArr": objectArr});

						/* restarts process only if a command had activated the prompt */
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

/* updates button that stored a specific tab color with tab information AND REPLACES THE BUTTON */
function replaceButton(replacementButton, promptUser)
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var groupObject = {};

		/* stores information from all of the tabs into an object and then puts object into storage */
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
	
			/* put everything in query because of how the asynchronous function does not initializing currentFaviconURL before storing the object */
			chrome.tabs.query({active: true, currentWindow: true}, function(tab)
			{
				var currentFaviconURL = tab[0].favIconUrl;
	
				/* removes favicon urls that are not colored from tab colors array */
				for (var i = 0; i < tabColorsArr.length; i++)
				{
					if (tabColorsArr[i] != currentFaviconURL)
					{
						tabColorsArr.splice(i, 1);
						// removes name of array
						tabNamesArr.splice(i, 1);
						// removes url of array
						tabUrlsArr.splice(i, 1);
						// decrements tab count as tab is removed
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
				// removes added button from end of popup (caused by asynchronous function)
				group.objectArr.splice(group.objectArr.length - 1, 1);

				var objectArr = group.objectArr;
				// updates storage with new objectArr with groupObject
				chrome.storage.local.set({"objectArr": objectArr});

				// refresh popup so added duplicate button is not displayed (caused by asynchronous function)
				chrome.runtime.sendMessage({msg: "reload popup"});
			})
		})
	})
}

/* updates button that stored all of the user's tabs with new tab information AND REPLACES THE BUTTON */
function replaceAllButton(replacementButton, promptUser)
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var groupObject = {};

		/* stores information from all of the tabs into an object and then puts object into storage */
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
			chrome.runtime.sendMessage({msg: "reload popup"});
		})
	})
}

// for keeping title through tab refresh 
// (saveTitle is initialized in ActivityTabFeatures(command) under "custom-title-toggle-feature")
var saveTitle = {};
// for keeping color through tab refresh
var saveColor = {};

/* saves the color and the title of the tab to keep them through a tab refresh; 
   updates "sameColorTabs" context menu when the tab color is changed, opened, or when the tab becomes "active" */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request != "none")
	{
		if (request.color)
		{
			saveColor[request.tabid] = request.color;
		}
	}
	else if (request == "none" || request == undefined)
	{
		chrome.contextMenus.remove("sameColorTabs");
	}
					
	if (request.name)
	{
		saveTitle[tab[0].id] = request.name;
	}

	/* updates "sameColorTabs" context menu text */
	switch (request.color)
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
			chrome.contextMenus.remove("sameColorTabs");
			break;
	}
})

/* changes the "Save [COLOR] Tabs" context menu text to reflect the color of the current tab when the tab becomes "active" */
chrome.tabs.onActivated.addListener(function(activeInfo)
{
	// query is solely used for checking if the tab is a new tab to remove the "Save [COLOR] Tabs" context menu
    chrome.tabs.query({active: true, currentWindow: true}, function(tab) 
	{
		// removes "Save [COLOR] Tabs" context menu if tab is a new tab
		if (tab[0].url == "chrome://newtab/")
		{
			chrome.contextMenus.remove("sameColorTabs");
		}
		// check if the current tab is the activated tab so then the color of a tab that is not the active tab will not be changed
		// ex: colored tab is loading, user switches to another tab, new tab will not be assigned/stored color of loading tab
		else if (tab[0].id == activeInfo.tabId)
		{
			chrome.tabs.sendMessage(activeInfo.tabId, {changeContextMenu: "changeContextMenu"}, function(response){});
		}
	})
})

/* changes the "Save [COLOR] Tabs" context menu text to reflect the color of the current tab when a tab is created */
chrome.tabs.onCreated.addListener(function(tab)
{
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
	{
		if (changeInfo.status === "complete")
		{
			// sends a message to the content script to detect the color of the tab (if any) and set the context menu accordingly
			chrome.tabs.sendMessage(tab.id, {changeContextMenu: "changeContextMenu", onUpdated: "onUpdated"}, function(response){});
		}
	})
})

/* deletes the tab color that is saved in saveColor if color button is pressed;
   if not deleted, asynchronous function calls would make the color in saveColor override the color from the button */
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

/* removes the color and the title of a tab from saveColor and saveTitle once the tab is closed */
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo)
{
	delete saveColor[tabId];
	delete saveTitle[tabId];
})

// stores the title of tabs for later use when the tabs are updated
var tabIdsToTitles = {};
// stores color of tabs for later use when the tabs are updated
var tabIdsToColor = {};

/* keeps the tab's title and color persistent tab refresh if applicable; keeps SAVED tab's title and color persistent through refresh */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	/* once content script has finished loading in the new tab, send a message with the tab's title and color to the content script;
	   keeps the title and color from the SAVED tabs persistent through refresh (content script would not be able to received message if page 
	   has not been loaded) */

	/* changes the tab's title and color after tab refresh if applicable */
	if (tabIdsToTitles[tabId] && changeInfo.status === "complete")
	{
		chrome.tabs.sendMessage(tabId, {getTitle: tabIdsToTitles[tabId]}, function(response){});
		chrome.tabs.sendMessage(tabId, {getColor: tabIdsToColor[tabId]}, function(response){});
	}

	if (changeInfo.status === "complete")
	{
		// tab's title was changed
		if (saveTitle[tabId] != null)
		{
			// tab's title sent to content script
			chrome.tabs.sendMessage(tabId, {title: saveTitle[tabId]}, function(response){});
		}

		// looks at current tab
		chrome.tabs.query({active: true, currentWindow: true}, function(tab)
		{
			/* sends message to content script if tab is supposed to be colored; tabId is checked so that if tab is being launched by
			a button in the popup that stores the tabs, the tab being launched will not be set to the color of the current active tab */

			if (saveColor[tabId])
			{
				chrome.tabs.sendMessage(tabId, {color: saveColor[tabId]}, function(response){});
			}
		})
	}
})

/* creates the tabs (responds to a button in the popup that had stored colored tabs/all of the tabs in a single window) */
function createTab(group, i, j)
{
	/* creates the tabs */
	chrome.tabs.create({"url": group.objectArr[i]["tabUrls"][j], "active": false}, function(tab)
    {
		/* saves the title of the tab */
		var tabTitle = group.objectArr[i]["tabNames"][j];
		tabIdsToTitles[tab.id] = tabTitle;

		/* saves the color of the tab */
		var tabColor = group.objectArr[i]["tabColor"][j];
		tabIdsToColor[tab.id] = tabColor;
    })
}

/* creates the tabs (responds to a button in the popup that had stored all of the tabs) */
function createAllTabs(group, i, j)
{
	// creates all of the tabs of the current window
	chrome.windows.create({"url": group.objectArr[i]["tabUrls"][j], "state": "maximized"}, function(window)
	{
		/* iterates through the tabs of a window to assign tab names and tab color to the tabs */
		for (var k = 0; k < group.objectArr[i]["tabUrls"][j].length; k++)
		{
			/* saves the title of the tab */
			var tabTitle = group.objectArr[i]["tabNames"][j][k];
			tabIdsToTitles[window.tabs[k].id] = tabTitle;

			/* saves the color of the tab */
			var tabColor = group.objectArr[i]["tabColor"][j][k];
			tabIdsToColor[window.tabs[k].id] = tabColor;
		}
	})
}

/* creates the tabs in a new window (responds to a button in the popup that had stored all of the tabs) */
function createWindowTabs(group, i, j)
{
	/* creates a window with the first tab */
	if (j == 0)
	{
		chrome.windows.create({"url": group.objectArr[i]["tabUrls"][j], "state": "maximized"}, function(window)
		{
			// accesses the window's array of tabs to access the first tab's id to use to identify the tab for tabIdsToTitles and tabIdsToColor
			var firstTabInWindow = window.tabs[0].id;

			/* saves the title of the tab */
			var tabTitle = group.objectArr[i]["tabNames"][j];
			tabIdsToTitles[firstTabInWindow] = tabTitle;

			/* saves the color of the tab */
			var tabColor = group.objectArr[i]["tabColor"][j];
			tabIdsToColor[firstTabInWindow] = tabColor;
		})
	}
	else
	{
		/* creates the remaining tabs of the window */
		chrome.tabs.create({"url": group.objectArr[i]["tabUrls"][j], "active": false}, function(tab)
		{
			/* saves the title of the tab */
			var tabTitle = group.objectArr[i]["tabNames"][j];
			tabIdsToTitles[tab.id] = tabTitle;

			/* saves the color of the tab */
			var tabColor = group.objectArr[i]["tabColor"][j];
			tabIdsToColor[tab.id] = tabColor;
		})
	}
}