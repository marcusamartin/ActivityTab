/* waits for popup button press and then sends message with button info to content.js */
document.addEventListener("DOMContentLoaded", function()
{
	/* red button */
	var button = document.getElementById("redButton");
	button.addEventListener("click", function()
	{
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
			// selected tab, {color property = button, button property = color}, response for error message (not needed)
            chrome.tabs.sendMessage(tabs[0].id, {button: "buttonPress", color: "red"}, function(response) {});
        })
	})

	/* green button */
	var button = document.getElementById("greenButton");
	button.addEventListener("click", function()
	{
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
			// selected tab, {color property = button, button property = color}, response for error message (not needed)
            chrome.tabs.sendMessage(tabs[0].id, {button: "buttonPress", color: "green"}, function(response) {});
        })
	})

	/* blue button */
	var button = document.getElementById("blueButton");
	button.addEventListener("click", function()
	{
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
			// selected tab, {color property = button, button property = color}, response for error message (not needed)
            chrome.tabs.sendMessage(tabs[0].id, {button: "buttonPress", color: "blue"}, function(response) {});
        })
	})

	/* yellow button */
	var button = document.getElementById("yellowButton");
	button.addEventListener("click", function()
	{
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
			// selected tab, {color property = button, button property = color}, response for error message (not needed)
            chrome.tabs.sendMessage(tabs[0].id, {button: "buttonPress", color: "yellow"}, function(response) {});
        })
	})

	/* orange button */
	var button = document.getElementById("orangeButton");
	button.addEventListener("click", function()
	{
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
			// selected tab, {color property = button, button property = color}, response for error message (not needed)
            chrome.tabs.sendMessage(tabs[0].id, {button: "buttonPress", color: "orange"}, function(response) {});
        })
	})

	/* purple button */
	var button = document.getElementById("purpleButton");
	button.addEventListener("click", function()
	{
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
			// selected tab, {color property = button, button property = color}, response for error message (not needed)
            chrome.tabs.sendMessage(tabs[0].id, {button: "buttonPress", color: "purple"}, function(response) {});
        })
	})
})

// calls function to populate buttons for popup
insertButtons();

/* Inserts buttons into popup */
function insertButtons()
{
	var groupCount;
	var buttonCount;

	chrome.storage.local.get(["groupCount", "buttonCount"], function(group)
	{
		groupCount = group.groupCount;
		buttonCount = group.buttonCount;

		// console.log("groupCount: " + groupCount);
		
		/* checks if there are no buttons */
		if (groupCount == 0)   // enables empty text to be displayed
		{
			document.getElementById("groupButtons").innerHTML = "No tabs are saved!";
			document.getElementById("groupButtons").style.color = "blue";
			document.getElementById("groupButtons").style.width = "532px";
			document.getElementById("groupButtons").style.fontWeight = "900";
			document.getElementById("groupButtons").style.fontSize = 20;
			document.getElementById("groupButtons").style.textAlign = "center";

			// console.log("buttonCount: " + buttonCount);
			chrome.storage.local.set({"buttonCount": 0});   // sets button count to 0 since there are no buttons
		}
		/* creates the buttons */
		else
		{
			for (var i = 0; i < buttonCount; i++)
			{
				// console.log("for buttonCount: " + buttonCount);
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

function getStorage(i)   // i == groupCount
{
	chrome.storage.local.get(["groupName" + i, "tabCount" + i, "tabUrls" + i, "tabNames" + i], function(group)
	{
		/* checks  if storage is empty or if a group was deleted */
		if (group["groupName" + i] == null)
		{
			// console.log("empty");
			return;
		}

		/* tab button */
		var groupButton = document.createElement("button");
		/* set css of button */
		groupButton.id = "groupButton";
		groupButton.innerHTML = group["groupName" + i];   // displays name of the button
		// puts button in popup
		document.getElementById("groupButtons").appendChild(groupButton);   // used to be appendChild

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

		/* window button */
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
			//chrome.windows.create({"url": group["tabUrls" + i], "state": "maximized"});
		}

		/* trash button */
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
				chrome.storage.local.remove(["groupName" + i, "tabNames" + i, "tabUrls" + i, "tabCount" + i]);

				/* last button is deleted, so button counter can be decreased by 1 */
				chrome.storage.local.get("buttonCount", function(group2)
				{
					if ((i + 1) == group2.buttonCount)   // (i + 1) == last button
					{
						var subtractOne = (group2.buttonCount) - 1;
						// console.log(subtractOne);
						chrome.storage.local.set({"buttonCount": subtractOne});
					}
				})

				chrome.storage.local.get("groupCount", function(group)
				{
					/* debugging */
					chrome.storage.local.get(null, function(items) 
					{
						var allKeys = Object.keys(items);
						// console.log("storage: " + allKeys);
					})

					var resetGroupCount = group.groupCount - 1;
					// subtract one from groupCount for removal of a group
					chrome.storage.local.set({"groupCount": resetGroupCount}, function()
					{
						window.location.reload();
					})
					// console.log("resetGroupCount: " + resetGroupCount);
				})
			}
		}
	})
}

/* for custom title of tabs */
document.addEventListener("DOMContentLoaded", function()
{    
	/* registers enter key press for title text field */
	var customTitleTextField = document.getElementById("customTitleField");
	customTitleTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13) 
		{
			renameTab();
		}
	})

	/* registers enter key press for save tabs text field */
	var saveTabsTextField = document.getElementById("saveTabsTextField");
	saveTabsTextField.addEventListener("keyup", function(enterKey)
	{
		if (enterKey.keyCode == 13) 
		{
			var storeTabsTextField = document.getElementById("saveTabsTextField").value;

			// refer to background page because popup is automatically closed when a tab is created,
			// so callback function would never execute
			chrome.extension.getBackgroundPage().storeTabsTextField(storeTabsTextField);
			window.location.reload();
		}
	})

	// text field is selected when extension icon is clicked
	document.getElementById("customTitleField").focus();
})

/* gets title from text field and renames the tab */
function renameTab()
{
	// get text from text field
	var customTitleField = document.getElementById("customTitleField").value;
	// console.log("customTitleField: " + customTitleField);
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		// title sent to content script
		chrome.tabs.sendMessage(tabs[0].id, {name: customTitleField}, function(response){});
		// title sent to background script
		chrome.runtime.sendMessage({id: tabs[0].id, name: customTitleField}, function(response) {});
	})
}