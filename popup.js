// calls function continuously to populate buttons for popup
displayButtons();

/* Display buttons in popup */
function displayButtons()
{
	chrome.storage.local.get("objectArr", function(group)
	{
		var objectArr = group.objectArr;
		// console.log("group[objectArr][0][tabUrls + groupCount][0]: " + group["objectArr"][0]["tabUrls" + groupCount][0]);
		
		/* checks if there are no buttons to display empty text */
		if (objectArr.length == 0)
		{
			console.log("setEmptyText");
			setEmptyText();
		}
		/* creates the buttons */
		else
		{
			console.log("create the buttons");
			console.log("objectArr.length: " + objectArr.length);
			for (var i = 0; i < objectArr.length; i++)
			{
				getStorage(group, i);
			}
		}
	})
}

/* displays empty text when there are no buttons to display */
function setEmptyText()
{
	document.getElementById("groupButtons").innerHTML = "No tabs are saved!";
	document.getElementById("groupButtons").style.color = "#7DF9FF";
	document.getElementById("groupButtons").style.width = "532px";
	document.getElementById("groupButtons").style.fontWeight = "900";
	document.getElementById("groupButtons").style.fontSize = 20;
	document.getElementById("groupButtons").style.textAlign = "center";
}

/* gets and displays tab, window, and trash buttons from storage */
function getStorage(group, i)
{
	/* displays the buttons related to the tabs */
	displayTabButton(group, i);
	displayWindowButton(group, i);
	displayTrashButton(group, i);
}

/* display tab button */
function displayTabButton(group, i)
{
	// console.log("group[objectArr][0][tabUrls + groupCount][0]: " + group["objectArr"][0]["tabUrls" + groupCount][0]);

	var objectArr = group.objectArr;

	var groupButton = document.createElement("button");

	/* set css of button */
	groupButton.id = "groupButton";
	// groupButton.innerHTML = group["groupName" + i];
	groupButton.innerHTML = objectArr[i]["groupName"];
	console.log("groupButton.innerHTML: " + groupButton.innerHTML);

	// colors tab button
	colorButton(groupButton, group, i);

	// puts button in popup
	document.getElementById("groupButtons").appendChild(groupButton);

	/* opens tabs if button is clicked */
	groupButton.onclick = function()
	{
		/* if tabs in multiple windows were saved and if tabs in one window were saved */
		// 0 is the flag to know that the user saved all their tabs with only one window open
		// if (group["tabCount" + i][1] != undefined || group["tabCount" + i][1] == 0)
		if (objectArr[i]["tabCount"][1] != undefined || objectArr[i]["tabCount"][1] == 0)
		{
			/* traverses the windows */
			// for (var j = 0; j < group["tabCount" + i].length; j++)
			for (var j = 0; j < objectArr[i]["tabCount"].length; j++)
			{
				// 0 shows that it is a single window, so cannot access a valid url when j equals 1
				// if (group["tabCount" + i][j] == 0)
				if (objectArr[i]["tabCount"][j] == 0)
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
			// for (var j = 0; j < group["tabCount" + i]; j++)
			for (var j = 0; j < objectArr[i]["tabCount"]; j++)
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
	var objectArr = group.objectArr;
	/* button opens a single window */
	// if (group["tabCount" + i][1] == undefined)
	if (objectArr[i]["tabCount"][1] == undefined)
	{
		var windowButton = document.createElement("button");

		// set css of button
		windowButton.id = "windowButton";
		windowButton.className = "fa fa-external-link";
		// sizes icon
		windowButton.style.fontSize = "35px";
		windowButton.style.width = "80px";

		// appends button to corresponding tab button
		document.getElementById("groupButtons").appendChild(windowButton);

		// colors window button
		colorButton(windowButton, group, i);
	
		/* creates a new window with saved tabs */
		windowButton.onclick = function()
		{
			// for (var j = 0; j < group["tabCount" + i]; j++)
			for (var j = 0; j < objectArr[i]["tabCount"]; j++)
			{
				chrome.extension.getBackgroundPage().createWindowTabs(group, i, j);
			}
		}
	}
	/* button opens multiple windows */
	// else if (group["tabCount" + i][1] != undefined)
	else if (objectArr[i]["tabCount"][1] != undefined)
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
			// for (var j = 0; j < group["tabCount" + i]; j++)
			for (var j = 0; j < objectArr[i]["tabCount"]; j++)
			{
				chrome.extension.getBackgroundPage().createWindowTabs(group, i, j);
			}
		}

		// disables button as it is unnecessary when the tabs button opens multiple windows already
		windowButton.disabled = true;
		// sets background color of button to reflect that the button is disabled
		windowButton.style.backgroundColor = "#AAB4AF";
	}
}

/* display trash button */
function displayTrashButton(group, i)
{
	var objectArr = group.objectArr;

	var trashButton = document.createElement("button");

	// set css of button
	trashButton.id = "trashButton";
	trashButton.className = "fa fa-trash";
	// colors trash button
	colorButton(trashButton, group, i);
	// sizes icon
	trashButton.style.fontSize = "35px";

	// appends button to corresponding tab button
	document.getElementById("groupButtons").appendChild(trashButton);

	/* deletes group if trash icon is clicked  */
	trashButton.onclick = function()
	{
		// var confirmDelete = confirm("Are you sure you want to delete " + group["groupName" + i] + "?");
		var confirmDelete = confirm("Are you sure you want to delete " + objectArr[i]["groupName"] + "?");
		if (confirmDelete)
		{
			// removes the group name, tab names, tab urls, and number of tabs from storage
			// chrome.storage.local.remove(["groupName" + i, "tabNames" + i, "tabUrls" + i, "tabColor" + i, "tabCount" + i]);

			// remove object at specific index
			objectArr.splice(i, 1);

			chrome.storage.local.set({"objectArr": objectArr});

			/* button is deleted, so group count can be decreased by 1 */
			// PROBLEM: NEXT BUTTON ADDED REPLACES EXISTING BUTTON
			// NOT DECREMENTING GROUPCOUNT FIXES THE PROBLEM
			// BUT THEN SETEMPTYTEXT IS NEVER SET
			chrome.storage.local.get("objectArr", function(group)
			{
				if (group.objectArr.length == 0)
				{
					setEmptyText();
				}

				// maybe put above if statement?
				window.location.reload();
			})
		}
	}
}

/* waits for popup color button press and then sends message with button info to content script to change the tab color */
// select menu, select trash button, and sortTabsTextField do not send any message
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

	// title text field is selected when popup is displayed
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
			window.location.reload();
		}
	})

	/* sets border color for sort tabs text field */
	setSortTabsTextFieldBorderColor();

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
			window.location.reload();
		}
	})

	/* changes select button color when dropdown menu is selected */
	var select = document.getElementById("selectMenu");
	select.onchange = function() 
	{
		// gets selected dropdown menu's className to get it's properties
		select.className = this.options[this.selectedIndex].className;
		// color select menu's trash button
		colorSelectMenuTrashButton(button, select.className);
	}

	/* select trash button */
	var button = document.getElementById("selectMenuTrashButton");
	colorSelectMenuTrashButton(button, select.className);
	button.addEventListener("click", function()
	{
		queryDropDownClick(select.className);
	})
})

/* sends message with button info to content script */
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

/* sets the background color of the button to correspond with it's tab colors */
function colorButton(button, group, i)
{
	/* colors buttons */
	// just needs to check first tab since all tabs are colored (from saveColorTabs)
	// var tabColor = group["tabColor" + i][0];
	var tabColor = group.objectArr[i]["tabColor"][0];
	var redURL = chrome.runtime.getURL("img/red-circle-16.png");
	var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
	var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
	var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
	var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

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
			break;
	}
}

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

/* checks current tab's favicon url and determines if sort tabs text field color should be changed */
function setSortTabsTextFieldBorderColor()
{
	/* urls of color favicons */
	var redURL = chrome.runtime.getURL("img/red-circle-16.png");
	var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
	var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

	// checks current tab's favicon url
	chrome.tabs.query({active: true, currentWindow: true}, function(tab)
	{
		switch (tab[0].favIconUrl)
		{
			case redURL:
				document.getElementById("sortTabsTextField").placeholder = "Save red tabs";
				document.getElementById("sortTabsTextField").style.backgroundColor = "#FF7F66";
				document.getElementById("sortTabsTextField").style.border = "3px solid #FF3333";
				break;
			case greenURL:
				document.getElementById("sortTabsTextField").placeholder = "Save green tabs";
				document.getElementById("sortTabsTextField").style.border = "3px solid #5DE619";
				break;
			case blueURL:
				document.getElementById("sortTabsTextField").placeholder = "Save blue tabs";
				document.getElementById("sortTabsTextField").style.border = "3px solid #197FE6";
				break;
			case yellowURL:
				document.getElementById("sortTabsTextField").placeholder = "Save yellow tabs";
				document.getElementById("sortTabsTextField").style.border = "3px solid 	#F2F20D";
				break;
			case orangeURL:
				document.getElementById("sortTabsTextField").placeholder = "Save orange tabs";
				document.getElementById("sortTabsTextField").style.border = "3px solid #F5993D";
				break;
			case purpleURL:
				document.getElementById("sortTabsTextField").placeholder = "Save purple tabs";
				document.getElementById("sortTabsTextField").style.border = "3px solid #B152E0";
				break;
			default:
				document.getElementById("sortTabsTextField").style.border = "3px solid #3B3B3B";
				document.getElementById("sortTabsTextField").style.backgroundColor = "#AAAFB4";
				document.getElementById("sortTabsTextField").disabled = true;
				break;
		}
	})
}

/* reloads popup after sort tabs text field's border color was changed */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.msg === "color command")
	{
		window.location.reload();
	}
})

/* colors select menu's trash button with corresponding color to select menu */
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

/* deletes tabs of specified color */
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

/* iterates through current tabs in window and deletes tabs of specified color */
function checkAndRemoveFaviconURL(color)
{
	/* urls of color favicons */
	var redURL = chrome.runtime.getURL("img/red-circle-16.png");
	var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
	var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

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