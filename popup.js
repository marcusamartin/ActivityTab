/* waits for popup button press and then sends message with button info to content.js */
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

	/* changes select button color */
	var select = document.getElementById("mySelect");
	select.onchange = function() 
	{
		select.className = this.options[this.selectedIndex].className;
	}
})

/* sends message with button info to content.js */
function queryButtonClick(buttonPress, color)
{
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
	{
		// selected tab, {button property = button pressed, color property = button color}, response for error message (not needed)
		chrome.tabs.sendMessage(tabs[0].id, {button: buttonPress, color: color}, function(response) {});
	})
}

function queryDropDownClick(menuItem)
{
	switch(menuItem)
    {
		case "menu1":
			var confirmDelete = confirm("Are you sure you want to delete all red tabs?");

			if (confirmDelete)
			{
				checkFaviconURL("red");
			}
            break;
        case "menu2":
			var confirmDelete = confirm("Are you sure you want to delete all green tabs?");

			if (confirmDelete)
			{
				checkFaviconURL("green");
			}
            break;
        case "menu3":
			var confirmDelete = confirm("Are you sure you want to delete all blue tabs?");

			if (confirmDelete)
			{
				checkFaviconURL("blue");
			}
            break;
        case "menu4":
			var confirmDelete = confirm("Are you sure you want to delete all yellow tabs?");

			if (confirmDelete)
			{
				checkFaviconURL("yellow");
			}
            break;
        case "menu5":
			var confirmDelete = confirm("Are you sure you want to delete all orange tabs?");

			if (confirmDelete)
			{
				checkFaviconURL("orange");
			}
            break;
        case "menu6":
			var confirmDelete = confirm("Are you sure you want to delete all purple tabs?");

			if (confirmDelete)
			{
				checkFaviconURL("purple");
			}
            break;
        default:
            break;
    }
}

function checkFaviconURL(color)
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
		if (groupCount == 0)
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
			console.log("after displaying all the buttons, storage: " + allKeys);
		})
		chrome.storage.local.get("groupCount", function(groups)
		{
			console.log("after displaying all the buttons, groupCount: " + groups.groupCount);
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

		console.log("getStorage groupCount: " + i);

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

	/* opens tabs if button is clicked */
	groupButton.onclick = function()
	{
		/* opens the tabs */
		for (var j = 0; j < group["tabCount" + i]; j++)
		{
			chrome.extension.getBackgroundPage().createTab(group, i, j);
			// cannot use callback function because popup is immediately closed upon tab creation, have to use background script
			// chrome.tabs.create({"url": group["tabUrls" + i][j], "active": false});
		}
	}
}

/* display window button */
function displayWindowButton(group, i)
{
	var windowButton = document.createElement("button");
	// set css of button
	windowButton.id = "windowButton";
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
}

/* display trash button */
function displayTrashButton(group, i)
{
	var trashButton = document.createElement("button");
	// set css of button
	trashButton.id = "trashButton";
	// appends button to corresponding tab button
	document.getElementById("groupButtons").appendChild(trashButton);

	/* deletes group if trash icon is clicked  */
	trashButton.onclick = function()
	{
		var confirmDelete = confirm("Are you sure you want to delete " + group["groupName" + i] + "?");
		if (confirmDelete)
		{
			// removes the group name, tab names, tab urls, and number of tabs from storage
			chrome.storage.local.remove(["groupName" + i, "tabNames" + i, "tabUrls" + i, "tabColor" + i, "tabCount" + i]);

			/* last button is deleted, so button counter can be decreased by 1 */
			chrome.storage.local.get("buttonCount", function(group2)
			{
				// (i + 1) == last button
				if ((i + 1) == group2.buttonCount)
				{
					var subtractOne = (group2.buttonCount) - 1;
					chrome.storage.local.set({"buttonCount": subtractOne});
				}
			})

			/* debugging */
			chrome.storage.local.get("groupCount", function(group)
			{
				chrome.storage.local.get(null, function(items) 
				{
					var allKeys = Object.keys(items);
				})

				var resetGroupCount = group.groupCount - 1;
				// subtract one from groupCount for removal of a group
				chrome.storage.local.set({"groupCount": resetGroupCount}, function()
				{
					window.location.reload();
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
			window.location.reload();
		}
	})
})

/* gets title from text field and renames the tab */
function renameTab()
{
	// get text from text field
	var customTitleField = document.getElementById("customTitleField").value;
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		// title sent to content script
		chrome.tabs.sendMessage(tabs[0].id, {name: customTitleField}, function(response){});
		// title sent to background script
		chrome.runtime.sendMessage({id: tabs[0].id, name: customTitleField}, function(response) {});
	})
}

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */

// Close the dropdown menu if the user clicks outside of it
// alert(document.getElementsByClassName("dropbtn"));
// document.getElementsByClassName("dropdown-content").onclick = function()
// {
// 	console.log('ok');
// }