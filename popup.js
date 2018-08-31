/* waits for popup color button press and then sends message with button info to content.js */
// select menu, select trash button, and sortTabsTextField do not send any message
document.addEventListener("DOMContentLoaded", function()
{
	/* sets border color for sort tabs text field */
	setSortTabsTextFieldBorderColor();

	/* red button */
	var button = document.getElementById("redButton");
	button.addEventListener("click", function()
	{
		queryButtonClick("buttonPress", "red");
	})

	/* green button */
	var button = document.getElementById("greenButton");
	button.addEventListener("click", function()
	{
		// console.log("green button press");
		queryButtonClick("buttonPress", "green");
	})

	/* blue button */
	var button = document.getElementById("blueButton");
	button.addEventListener("click", function()
	{
		queryButtonClick("buttonPress", "blue");
	})

	/* yellow button */
	var button = document.getElementById("yellowButton");
	button.addEventListener("click", function()
	{
		queryButtonClick("buttonPress", "yellow");
	})

	/* orange button */
	var button = document.getElementById("orangeButton");
	button.addEventListener("click", function()
	{
		queryButtonClick("buttonPress", "orange");
	})

	/* purple button */
	var button = document.getElementById("purpleButton");
	button.addEventListener("click", function()
	{
		queryButtonClick("buttonPress", "purple");
	})

	/* changes select button color */
	var select = document.getElementById("mySelect");
	select.onchange = function() 
	{
		// selects menu1, menu2, etc
		select.className = this.options[this.selectedIndex].className;
	}

	/* select trash button */
	var button = document.getElementById("selectTrashButton");
	button.addEventListener("click", function()
	{
		queryDropDownClick(select.className);
	})
})

/* checks current tab's favicon url and determines if sort tabs text field color should be changed */
function setSortTabsTextFieldBorderColor()
{
	var redURL = chrome.runtime.getURL("img/red-circle-16.png");
	var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
	var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

	// checks current tab's favicon url
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		// console.log("tab.favIconUrl: " + tab[0].favIconUrl);
		switch(tab[0].favIconUrl)
		{
			case redURL:
				document.getElementById("sortTabsTextField").style.border = "3px solid #FF0000";
				break;
			case greenURL:
				document.getElementById("sortTabsTextField").style.border = "3px solid #00FF00";
				break;
			case blueURL:
				document.getElementById("sortTabsTextField").style.border = "3px solid #0000FF";
				break;
			case yellowURL:
				document.getElementById("sortTabsTextField").style.border = "3px solid #FFFF00";
				break;
			case orangeURL:
				document.getElementById("sortTabsTextField").style.border = "3px solid #FFA500";
				break;
			case purpleURL:
				document.getElementById("sortTabsTextField").style.border = "3px solid #A020F0";
				break;
			default:
				document.getElementById("sortTabsTextField").style.border = "3px solid #000000";
				document.getElementById("sortTabsTextField").style.backgroundColor = "#AAAFB4";
				document.getElementById("sortTabsTextField").disabled = true;
				break;
		}
	})
}

/* sends message with button info to content.js */
function queryButtonClick(buttonPress, color)
{
	// console.log("queryButtonClick--------------");
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// console.log("sending message, button:color" + buttonPress + ":" + color);
		// selected tab, {button property = button pressed, color property = button color}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {button: buttonPress, color: color}, function(response) {});
		// console.log("right before deleteSaveColor()");
		chrome.extension.getBackgroundPage().deleteSaveColor(color);
		// refreshes popup to change sort tabs text field's border color to correct color
		console.log("RELOAD3----------------------------------------");
		window.location.reload();
	})
}

/* deletes tabs of specified color */
function queryDropDownClick(menuItem)
{
	switch(menuItem)
    {
		case "menu1":
			var confirmDelete = confirm("Are you sure you want to delete all red tabs?");

			if (confirmDelete)
			{
				checkAndRemoveFaviconURL("red");
			}
            break;
        case "menu2":
			var confirmDelete = confirm("Are you sure you want to delete all green tabs?");

			if (confirmDelete)
			{
				checkAndRemoveFaviconURL("green");
			}
            break;
        case "menu3":
			var confirmDelete = confirm("Are you sure you want to delete all blue tabs?");

			if (confirmDelete)
			{
				checkAndRemoveFaviconURL("blue");
			}
            break;
        case "menu4":
			var confirmDelete = confirm("Are you sure you want to delete all yellow tabs?");

			if (confirmDelete)
			{
				checkAndRemoveFaviconURL("yellow");
			}
            break;
        case "menu5":
			var confirmDelete = confirm("Are you sure you want to delete all orange tabs?");

			if (confirmDelete)
			{
				checkAndRemoveFaviconURL("orange");
			}
            break;
        case "menu6":
			var confirmDelete = confirm("Are you sure you want to delete all purple tabs?");

			if (confirmDelete)
			{
				checkAndRemoveFaviconURL("purple");
			}
            break;
        default:
            break;
    }
}

/* iterates through current tabs in window and deletes tabs of specified color */
function checkAndRemoveFaviconURL(color)
{
	var redURL = chrome.runtime.getURL("img/red-circle-16.png");
	var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
	var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

	chrome.tabs.query({currentWindow: true}, function (tabs)
	{
		for (var i = 0; i < tabs.length; i++)
		{
			switch(color)
			{
				case "red":
					if (tabs[i].favIconUrl == redURL)
					{
						chrome.tabs.remove(tabs[i].id);
					}
					break;
				case "green":
					if (tabs[i].favIconUrl == greenURL)
					{
						chrome.tabs.remove(tabs[i].id);
					}
					break;
				case "blue":
					if (tabs[i].favIconUrl == blueURL)
					{
						chrome.tabs.remove(tabs[i].id);
					}
					break;
				case "yellow":
					if (tabs[i].favIconUrl == yellowURL)
					{
						chrome.tabs.remove(tabs[i].id);
					}
					break;
				case "orange":
					if (tabs[i].favIconUrl == orangeURL)
					{
						chrome.tabs.remove(tabs[i].id);
					}
					break;
				case "purple":
					if (tabs[i].favIconUrl == purpleURL)
					{
						chrome.tabs.remove(tabs[i].id);
					}
					break;
				default:
					break;
			}
		}
	})
}

// calls function continuously to populate buttons for popup
displayButtons();

/* Display buttons in popup */
function displayButtons()
{
	var groupCount;
	var buttonCount;

	chrome.storage.local.get(["groupCount", "buttonCount"], function(group)
	{
		groupCount = group.groupCount;
		buttonCount = group.buttonCount;
		
		/* checks if there are no buttons to display empty text */
		// if (groupCount == 0)
		if (groupCount < 0 || buttonCount == 0)
		{
			setEmptyText();
			// sets button count to 0 since there are no buttons
			chrome.storage.local.set({"buttonCount": 0});
		}
		/* creates the buttons */
		else
		{
			for (var i = 0; i < buttonCount; i++)
			{
				getStorage(i);
			}
		}

		/* debugging */
		chrome.storage.local.get(null, function(items) 
		{
			var allKeys = Object.keys(items);
			// console.log("after displaying all the buttons, storage: " + allKeys);
		})
		chrome.storage.local.get("groupCount", function(groups)
		{
			// console.log("after displaying all the buttons, groupCount: " + groups.groupCount);
		})
	})
}

function setEmptyText()
{
	document.getElementById("groupButtons").innerHTML = "No tabs are saved!";
	document.getElementById("groupButtons").style.color = "blue";
	document.getElementById("groupButtons").style.width = "532px";
	document.getElementById("groupButtons").style.fontWeight = "900";
	document.getElementById("groupButtons").style.fontSize = 20;
	document.getElementById("groupButtons").style.textAlign = "center";
}

/* gets and displays tab, window, and trash buttons from storage */
// i == groupCount
function getStorage(i)
{
	chrome.storage.local.get(["groupName" + i, "tabCount" + i, "tabUrls" + i, "tabNames" + i, "tabColor" + i], function(group)
	{
		/* checks  if storage is empty or if a group was deleted (still checks group number if deleted) */
		if (group["groupName" + i] == null)
		{
			return;
		}

		// console.log("getStorage groupCount: " + i);

		displayTabButton(group, i);
		displayWindowButton(group, i);
		displayTrashButton(group, i);
	})
}

/* display tab button */
function displayTabButton(group, i)
{
	var groupButton = document.createElement("button");
	/* set css of button */
	groupButton.id = "groupButton";
	groupButton.innerHTML = group["groupName" + i];
	// puts button in popup
	document.getElementById("groupButtons").appendChild(groupButton);

	// colors tab button
	colorButton(groupButton, group, i);

	/* opens tabs if button is clicked */
	groupButton.onclick = function()
	{
		/* if tabs in multiple windows were saved */ // for one window save all tabs
		if (group["tabCount" + i][1] != undefined || group["tabCount" + i][1] == 0)
		{
			/* traverses the windows */
			for (var j = 0; j < group["tabCount" + i].length; j++)
			{
				// 0 shows that it is a single window, so cannot access a valid url at j = 1
				if (group["tabCount" + i][j] == 0)
				{
					return;
				}
				chrome.extension.getBackgroundPage().createAllTabs(group, i, j);
			}
		}
		else
		{
			console.log("opens the tabs");
			/* opens the tabs */
			for (var j = 0; j < group["tabCount" + i]; j++)
			{
				chrome.extension.getBackgroundPage().createTab(group, i, j);
				// cannot use callback function because popup is immediately closed upon tab creation, have to use background script
				// chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false});
			}
		}
	}
}

/* display window button */
function displayWindowButton(group, i)
{
	/* button opens a wingle window */
	if (group["tabCount" + i][1] == undefined)
	{
		var windowButton = document.createElement("button");
		// set css of button
		windowButton.id = "windowButton";
		windowButton.className = "fa fa-external-link";
		// sizes icon
		windowButton.style.fontSize = "35px";
		windowButton.style.width = "80px";
		// make button size be correct size
		// windowButton.style.height = "35px";
		// appends button to corresponding tab button
		document.getElementById("groupButtons").appendChild(windowButton);

		// colors window button
		colorButton(windowButton, group, i);
	
		/* creates a new window with saved tabs */
		windowButton.onclick = function()
		{
			for (var j = 0; j < group["tabCount" + i]; j++)
			{
				chrome.extension.getBackgroundPage().createWindowTabs(group, i, j);
			}
		}
	}
	/* button opens multiple windows */
	else if (group["tabCount" + i][1] != undefined)
	{
		var windowButton = document.createElement("form");
		// set css of button
		windowButton.id = "windowButton";
		windowButton.className = "fa fa-external-link";
		// sizes icon
		windowButton.style.fontSize = "35px";
		// make button size be correct size
		windowButton.style.height = "35px";
		// appends button to corresponding tab button
		document.getElementById("groupButtons").appendChild(windowButton);

		/* creates a new window with saved tabs */
		windowButton.onclick = function()
		{
			for (var j = 0; j < group["tabCount" + i]; j++)
			{
				chrome.extension.getBackgroundPage().createWindowTabs(group, i, j);
			}
		}
		// console.log("disabled");
		windowButton.disabled = true;
		windowButton.style.backgroundColor = "#AAB4AF";
	}
}

/* display trash button */
function displayTrashButton(group, i)
{
	var trashButton = document.createElement("button");
	// set css of button
	trashButton.id = "trashButton";
	trashButton.className = "fa fa-trash";
	// sizes icon
	trashButton.style.fontSize = "35px";
	// appends button to corresponding tab button
	document.getElementById("groupButtons").appendChild(trashButton);

	// colors trash button
	colorButton(trashButton, group, i);

	/* deletes group if trash icon is clicked  */
	trashButton.onclick = function()
	{
		var confirmDelete = confirm("Are you sure you want to delete " + group["groupName" + i] + "?");
		if (confirmDelete)
		{
			// removes the group name, tab names, tab urls, and number of tabs from storage
			chrome.storage.local.remove(["groupName" + i, "tabNames" + i, "tabUrls" + i, "tabColor" + i, "tabCount" + i]);

			/* last button is deleted, so button counter can be decreased by 1 */
			// groupCount should always be 1 less than buttonCount
			chrome.storage.local.get(["buttonCount", "groupCount"], function(group2)
			{
				alert("groupCount should be 1 less than buttonCount");
				alert("groupCount: " + group2.groupCount);
				alert("buttonCount: " + group2.buttonCount);
				// (i + 1) == last button
				if ((i + 1) == group2.buttonCount)
				{
					var subtractOne = (group2.buttonCount) - 1;
					chrome.storage.local.set({"buttonCount": subtractOne});
				}
			})

			chrome.storage.local.get(["groupCount", "buttonCount"], function(group)
			{
				alert("before groupCount reset: " + group.groupCount);
				var resetGroupCount = group.groupCount - 1;
				// var resetButtonCount = group.buttonCount - 1;
				// subtract one from groupCount for removal of a group
				chrome.storage.local.set({"groupCount": resetGroupCount}, function(group)
				{
					alert("RELOAD4----------------------------------------");
					window.location.reload();
				})
				
				alert("after groupCount reset: " + group.groupCount);

				/* sets empty text if removal of group results in zero buttons */
				chrome.storage.local.get(["groupCount", "buttonCount"], function(group)
				{
					alert("groupCount SETEMPTY: " + group.groupCount);
					alert("buttonCountSETEMPTY: " + group.buttonCount);
					if (group.groupCount == 0 || group.buttonCount == 0)
					{
						alert("yesSETEMPTY");
						setEmptyText();
					}
				})
			})
		}
	}
}

/* for titling tabs */
document.addEventListener("DOMContentLoaded", function()
{
	// text field is selected when extension icon is clicked
	document.getElementById("customTitleField").focus();

	/* registers enter key press for title text field */
	var customTitleTextField = document.getElementById("customTitleField");
	customTitleTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13) 
		{
			renameTab();
			// reloads popup immediately to show that tab was retitled
			window.location.reload();
		}
	})

	var sortTabsTextField = document.getElementById("sortTabsTextField");
	sortTabsTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13)
		{
			// get text from text field
			var storeSortTabsTextField = document.getElementById("sortTabsTextField").value;

			// refer to background page because popup is automatically closed when a tab is created,
			// so callback function would never execute
			chrome.extension.getBackgroundPage().storeSortTabsTextField(storeSortTabsTextField);
			// reloads popup immediately to display stored tab button
			console.log("RELOAD5----------------------------------------");
			window.location.reload();
		}
	})

	var allTabsTextField = document.getElementById("allTabsTextField");
	allTabsTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13)
		{
			// get text from text field
			var storeAllTabsTextField = document.getElementById("allTabsTextField").value;

			// refer to background page because popup is automatically closed when a tab is created,
			// so callback function would never execute
			chrome.extension.getBackgroundPage().storeAllTabsTextField(storeAllTabsTextField);
			// reloads popup immediately to display stored tab button
			console.log("RELOAD1----------------------------------------");
			window.location.reload();
		}
	})
})

/* gets title from text field and renames the tab */
function renameTab()
{
	// get text from text field
	var customTitleField = document.getElementById("customTitleField").value;
	
	if (customTitleField == "")
	{
		alert("Please enter a name for the tab!");
		return;
	}
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		// title sent to content script
		chrome.tabs.sendMessage(tabs[0].id, {name: customTitleField}, function(response){});
		// title sent to background script
		chrome.runtime.sendMessage({id: tabs[0].id, name: customTitleField}, function(response) {});
	})
}

/* correctly updates sort tabs text field's border color from command */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
	if (request.msg === "color command")
	{
		console.log("RELOAD2----------------------------------------");
		window.location.reload();
	}
	/* colors buttons after button is replaced; request.msg = i (to identify group) */
	else
	{
		// window.local.reload();
		// chrome.storage.local.get(["tabColor" + i], function(group)
		// {
		// 	colorButton("trashButton")
		// })
	}
})

function colorButton(button, group, i)
{
	/* colors buttons */
	// just needs to check first tab since all tabs are colored
	console.log('group["tabColor" + i][0]: ' + group["tabColor" + i][0]);
	var tabColor = group["tabColor" + i][0];
	var redURL = chrome.runtime.getURL("img/red-circle-16.png");
	var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
	var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
	var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
	var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

	switch(tabColor)
	{
		case redURL:
			button.style.backgroundColor = "#FF0000";
			break;
		case greenURL:
			button.style.backgroundColor = "#00FF00";
			break;
		case blueURL:
			button.style.backgroundColor = "#0000FF";
			break;
		case yellowURL:
			button.style.backgroundColor = "#FFFF00";
			break;
		case orangeURL:
			button.style.backgroundColor = "#FFA500";
			break;
		case purpleURL:
			button.style.backgroundColor = "#A020F0";
			break;
		default:
			break;
	}
}