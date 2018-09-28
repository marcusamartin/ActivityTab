// calls the function to populate buttons for popup when the extension icon is clicked
displayButtons();

/* Display the buttons in the popup */
function displayButtons()
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var objectArr = group.objectArr;
		
		/* if there are no buttons to display, display the empty text */
		if (objectArr.length == 0)
		{
			setEmptyText();
		}
		/* creates the buttons */
		else
		{
			for (var i = 0; i < objectArr.length; i++)
			{
				getStorage(group, i);
			}
		}
	})
}

/* displays the empty text when there are no buttons to display */
function setEmptyText()
{
	document.getElementById("groupButtons").innerHTML = "No tabs are saved!";
	/* style the text */
	document.getElementById("groupButtons").style.color = "#232323";
	document.getElementById("groupButtons").style.width = "500px";
	document.getElementById("groupButtons").style.fontWeight = "900";
	document.getElementById("groupButtons").style.fontSize = 20;
	document.getElementById("groupButtons").style.textAlign = "center";
}

/* displays the tab, window, and trash buttons from storage */
function getStorage(group, i)
{
	/* displays the buttons related to the tabs */
	displayTabButton(group, i);
	displayWindowButton(group, i);
	displayTrashButton(group, i);
}

/* display the tab button */
function displayTabButton(group, i)
{
	var objectArr = group.objectArr;

	var groupButton = document.createElement("button");

	/* style the button */
	groupButton.id = "groupButton";
	groupButton.innerHTML = objectArr[i]["groupName"];

	// colors the tab button according to the colors of the tabs that it stores
	colorButton(groupButton, group, i);

	// puts the button into the popup
	document.getElementById("groupButtons").appendChild(groupButton);

	/* opens the button's saved tabs if the button is clicked */
	groupButton.onclick = function()
	{
		/* if tabs in multiple windows were saved and if tabs in one window were saved */
		// 0 is the flag to know that the user saved all their tabs with only one window open
		if (objectArr[i]["tabCount"][1] != undefined || objectArr[i]["tabCount"][1] == 0)
		{
			/* traverses the windows */
			for (var j = 0; j < objectArr[i]["tabCount"].length; j++)
			{
				// 0 shows that it is a single window (cannot access a valid url when j equals 1)
				if (objectArr[i]["tabCount"][j] == 0)
				{
					return;
				}
				chrome.extension.getBackgroundPage().createAllTabs(group, i, j);
			}
		}
		else
		{
			/* opens the tabs if only color specific tabs or a single window was saved */
			for (var j = 0; j < objectArr[i]["tabCount"]; j++)
			{
				// cannot use callback function because popup is immediately closed upon tab creation; have to use background script
				// ex: chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false});
				chrome.extension.getBackgroundPage().createTab(group, i, j);
			}
		}
	}
}

/* displays the window button */
function displayWindowButton(group, i)
{
	var objectArr = group.objectArr;
	/* the button opens a single window */
	if (objectArr[i]["tabCount"][1] == undefined)
	{
		var windowButton = document.createElement("button");

		/* style the button */
		windowButton.id = "windowButton";
		windowButton.className = "fa fa-external-link";
		// size the icon's size
		windowButton.style.fontSize = "35px";
		// size the icon's width
		windowButton.style.width = "80px";

		// appends the button to it's corresponding tab button
		document.getElementById("groupButtons").appendChild(windowButton);

		// colors the window button
		colorButton(windowButton, group, i);
	
		/* creates a new window with the saved tabs of the button */
		windowButton.onclick = function()
		{
			for (var j = 0; j < objectArr[i]["tabCount"]; j++)
			{
				chrome.extension.getBackgroundPage().createWindowTabs(group, i, j);
			}
		}
	}
	/* the button opens multiple windows */
	else if (objectArr[i]["tabCount"][1] != undefined)
	{
		var windowButton = document.createElement("form");

		/* style the button */
		windowButton.id = "windowButton";
		windowButton.className = "fa fa-external-link";
		// size the icon's size
		windowButton.style.fontSize = "35px";
		// size the icon's width
		windowButton.style.height = "35px";

		// appends button to corresponding tab button
		document.getElementById("groupButtons").appendChild(windowButton);

		/* creates a new window with the saved tabs of the button */
		windowButton.onclick = function()
		{
			for (var j = 0; j < objectArr[i]["tabCount"]; j++)
			{
				chrome.extension.getBackgroundPage().createWindowTabs(group, i, j);
			}
		}

		// disables the button as it is unnecessary when the tab button opens multiple windows already
		windowButton.disabled = true;
		// sets the background color of the button to reflect that the button is disabled
		windowButton.style.backgroundColor = "#AAAFB4";
	}
}

/* displays the trash button */
function displayTrashButton(group, i)
{
	var objectArr = group.objectArr;

	var trashButton = document.createElement("button");

	/* style the button */
	trashButton.id = "trashButton";
	trashButton.className = "fa fa-trash";

	// colors the trash button
	colorButton(trashButton, group, i);
	// sizes the icon's size
	trashButton.style.fontSize = "35px";

	// appends the button to the corresponding tab button
	document.getElementById("groupButtons").appendChild(trashButton);

	/* deletes the group of tab, windown, and trash button if the trash icon is clicked, as well as the saved tabs for those buttons in storage  */
	trashButton.onclick = function()
	{
		var confirmDelete = confirm("Are you sure you want to delete " + objectArr[i]["groupName"] + "?");
		if (confirmDelete)
		{
			// remove the object at the specific index
			objectArr.splice(i, 1);

			chrome.storage.local.set({"objectArr": objectArr});

			/* set empty text if applicable */
			chrome.storage.local.get("objectArr", function(group)
			{
				if (group.objectArr.length == 0)
				{
					setEmptyText();
				}

				window.location.reload();
			})
		}
	}
}

/* waits for a popup color button press and then sends a message with the button info to the content script to change the tab's color 
   also waits for the select menu, select trash button, and "Save [COLOR] Tabs" text field */
// select menu, select trash button, and "Save [COLOR] Tabs" text field do not send any message
document.addEventListener("DOMContentLoaded", function()
{
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

	/* registers an enter key press for the "Rename the tab" text field */
	var customTitleTextField = document.getElementById("customTitleField");
	customTitleTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13)
		{
			// retitle the tab
			renameTab();
			// reload the popup to show that the tab was retitled
			window.location.reload();
		}
	})

	var sortTabsTextField = document.getElementById("sortTabsTextField");
	sortTabsTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13)
		{
			// get the text from text field
			var storeSortTabsTextField = document.getElementById("sortTabsTextField").value;

			// refer to background page because the popup is automatically closed when a tab is created,
			// so callback function would never execute
			chrome.extension.getBackgroundPage().storeSortTabsTextField(storeSortTabsTextField);
			// reloads popup immediately to display stored tab button
			window.location.reload();
		}
	})

	/* sets the "Save [COLOR] Tabs" text field's border color */
	setSortTabsTextFieldBorderColor();

	var allTabsTextField = document.getElementById("allTabsTextField");
	allTabsTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13)
		{
			// get text from text field
			var storeAllTabsTextField = document.getElementById("allTabsTextField").value;

			// refer to background page because popup is automatically closed when a tab is created,
			// so the callback function would never execute
			chrome.extension.getBackgroundPage().storeAllTabsTextField(storeAllTabsTextField);
			// reloads popup immediately to display stored tab button
			window.location.reload();
		}
	})

	/* changes the select button color when dropdown menu is selected */
	var select = document.getElementById("selectMenu");
	select.onchange = function() 
	{
		// gets the selected dropdown menu's className to get it's properties
		select.className = this.options[this.selectedIndex].className;
		// color the select menu's trash button
		colorSelectMenuTrashButton(button, select.className);
	}

	/* select trash button */
	var button = document.getElementById("selectMenuTrashButton");
	colorSelectMenuTrashButton(button, select.className);
	button.addEventListener("click", function()
	{
		// deletes the tabs of the specified color from the select menu
		queryDropDownClick(select.className);
	})
})

/* sends a message with the information of the button to the content script */
function queryButtonClick(buttonPress, color)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// selected tab, {button property = button pressed, color property = button color}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {button: buttonPress, color: color}, function(response) {});
		// deletes and reinitializes color in saveColor so tab color will be correct and persist through tab refresh
		chrome.extension.getBackgroundPage().deleteSaveColor(color);
		// refreshes popup to change sort tabs text field's border color to correct color
		window.location.reload();
	})
}

/* sets the background color of the button to correspond with the colors of it's saved tabs */
function colorButton(button, group, i)
{
	/* colors the buttons */
	// just needs to check the first tab since all of the tabs are the same color (from saveColorTabs)
	var tabColor = group.objectArr[i]["tabColor"][0];

	/* urls of color favicons */
	var redURL = chrome.runtime.getURL("img/red_circle_16.png");
	var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
	var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
	var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
	var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

	/* changes the button's background color */
	switch (tabColor)
	{
		case redURL:
			button.style.backgroundColor = "#FF3333";
			break;
		case greenURL:
			button.style.backgroundColor = "#5DE619";
			break;
		case blueURL:
			button.style.backgroundColor = "#197FE6";
			break;
		case yellowURL:
			button.style.backgroundColor = "#F2F20D";
			break;
		case orangeURL:
			button.style.backgroundColor = "#F5993D";
			break;
		case purpleURL:
			button.style.backgroundColor = "#B152E0";
			break;
		default:
			button.style.backgroundColor = "D2D2D2";
			break;
	}
}

/* gets the title from the "Rename the tab" text field and renames the tab */
function renameTab()
{
	// get the text from the text field
	var customTitleField = document.getElementById("customTitleField").value;
	
	if (customTitleField == "")
	{
		alert("Please enter a name for the tab!");
		return;
	}
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		// title sent to the content script to be changed
		chrome.tabs.sendMessage(tabs[0].id, {name: customTitleField}, function(response){});
		// title sent to the background script to be saved
		chrome.runtime.sendMessage({id: tabs[0].id, name: customTitleField}, function(response){});
	})
}

/* checks the current tab's favicon url and determines if the "Save [COLOR] Tabs" text field's border color should be changed */
function setSortTabsTextFieldBorderColor()
{
	/* urls of color favicons */
	var redURL = chrome.runtime.getURL("img/red_circle_16.png");
	var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
	var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
	var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
	var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

	// checks the current tab's favicon url
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		/* changes the text field's border color if applicable */
		switch (tab[0].favIconUrl)
		{
			case redURL:
				document.getElementById("sortTabsTextField").placeholder = "Save red tabs";
				document.getElementById("sortTabsTextField").style.border = "1px solid #FF3333";
				break;
			case greenURL:
				document.getElementById("sortTabsTextField").placeholder = "Save green tabs";
				document.getElementById("sortTabsTextField").style.border = "1px solid #5DE619";
				break;
			case blueURL:
				document.getElementById("sortTabsTextField").placeholder = "Save blue tabs";
				document.getElementById("sortTabsTextField").style.border = "1px solid #197FE6";
				break;
			case yellowURL:
				document.getElementById("sortTabsTextField").placeholder = "Save yellow tabs";
				document.getElementById("sortTabsTextField").style.border = "1px solid 	#F2F20D";
				break;
			case orangeURL:
				document.getElementById("sortTabsTextField").placeholder = "Save orange tabs";
				document.getElementById("sortTabsTextField").style.border = "1px solid #F5993D";
				break;
			case purpleURL:
				document.getElementById("sortTabsTextField").placeholder = "Save purple tabs";
				document.getElementById("sortTabsTextField").style.border = "1px solid #B152E0";
				break;
			default:
				document.getElementById("sortTabsTextField").style.border = "1px solid #AAAFB4";
				document.getElementById("sortTabsTextField").style.backgroundColor = "#AAAFB4";
				// disables the text field if the current tab is not colored
				document.getElementById("sortTabsTextField").disabled = true;
				break;
		}
	})
}

/* reloads the popup after "Save [COLOR] Tabs" text field's border color was changed */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.msg === "reload popup")
	{
		window.location.reload();
	}
})

/* colors the select menu's trash button to correspond with the select menu's color */
function colorSelectMenuTrashButton(button, menuItem)
{
	switch (menuItem)
    {
		case "menu1":
			button.style.backgroundColor = "#FF3333";
			break;
        case "menu2":
			button.style.backgroundColor = "#5DE619";
            break;
        case "menu3":
			button.style.backgroundColor = "#197FE6";
            break;
        case "menu4":
			button.style.backgroundColor = "#F2F20D";
            break;
		case "menu5":
			button.style.backgroundColor = "#F5993D";
			break;
		case "menu6":
			button.style.backgroundColor = "#B152E0";
            break;
		default:
            break;
    }
}

/* select trash button deletes the tabs of the specified color (from the select menu) */
function queryDropDownClick(menuItem)
{
	switch (menuItem)
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

/* iterates through the current tabs in the window and deletes the tabs of the specified color */
function checkAndRemoveFaviconURL(color)
{
	/* urls of color favicons */
	var redURL = chrome.runtime.getURL("img/red_circle_16.png");
	var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
	var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
	var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
	var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

	chrome.tabs.query({currentWindow: true}, function(tabs)
	{
		for (var i = 0; i < tabs.length; i++)
		{
			switch (color)
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