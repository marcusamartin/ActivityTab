/* sets tab title */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    /* title from command/saved title, title from popup text field, creating tabs with title */
    if (request.title || request.name || request.getTitle)
    {
        console.log("sets title: " + request.title);
        document.title = request.title || request.name || request.getTitle;
    }
    /* color from SAVED color */
    else if (request.color)
    {
        console.log("request.color: " + request.color);
        var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";

        setFaviconURL(request.color);
    }
    /* color from command */
    // request.getColor == actual favicon url
    else if (request.getColor)
    {
        console.log("setFaviconURL(request.getColor): " + request.getColor);
        var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";

        setFaviconURLFromURL(request.getColor);
    }
    /* command for left/right key */
    else if (request.command)
    {
        var color;

        /* determine correct color from left/right key command */
        if (request.command == "left-key-toggle-feature")
        {
            color = leftArrowKeyTabColor();
        }
        else
        {
            color = rightArrowKeyTabColor();
        }

        setFaviconURL(color);

        // not working, try sending a message
        //chrome.extension.getBackgroundPage().updatedSaveColor(color);
        //code to send message to open notification. This will eventually move into my extension logic
        // chrome.runtime.sendMessage({type: "notification", options: 
        // { 
        //     type: "basic", 
        //     iconUrl: chrome.extension.getURL("icon128.png"),
        //     title: "Test",
        //     message: "Test"
        // }})

        chrome.runtime.sendMessage(color, function(response){});   // sends red
    }
    /* popup color button press */
    else if (request.button == "buttonPress")
    {
        // set favicon url according to button color
        setFaviconURL(request.color);
    }
    else if (request.checkFaviconURL)
    {
        console.log("sender.tab: " + sender.tab);
        alert(document.querySelector("link[rel*='shortcut icon']").href);
        checkFaviconURL(request.checkFaviconURL, sender.tab);
    }
})

/* left arrow key: returns correct tab color by looking at favicon url */
function leftArrowKeyTabColor()
{
    // current favicon url of page
    var currentFaviconURL = document.querySelector("link[rel*='shortcut icon']").href;
    var redURL = chrome.runtime.getURL("img/red-circle-16.png");
    var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
    var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

    /* sets favicon url depending on current favicon url */
    if (currentFaviconURL != redURL && currentFaviconURL != greenURL && currentFaviconURL != blueURL &&
        currentFaviconURL != yellowURL && currentFaviconURL != orangeURL && currentFaviconURL != purpleURL)
    {
        // set to default red color
        return "red";
    }

    /* cycle through colors */
    switch(currentFaviconURL)
    {
        case purpleURL:
            return "orange";
        case orangeURL:
            return "yellow";
        case yellowURL:
            return "blue";
        case blueURL:
            return "green";
        case greenURL:
            return "red";
        // cycle back to purple
        case redURL:
            return "purple";
        default:
            return;
    }
}

/* right arrow key: returns correct tab color by looking at favicon url */
function rightArrowKeyTabColor()
{
    // current favicon url of page
    var currentFaviconURL = document.querySelector("link[rel*='shortcut icon']").href;
    var redURL = chrome.runtime.getURL("img/red-circle-16.png");
    var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
    var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

    /* sets favicon url depending on current favicon url */
    if (currentFaviconURL != redURL && currentFaviconURL != greenURL && currentFaviconURL != blueURL &&
        currentFaviconURL != yellowURL && currentFaviconURL != orangeURL && currentFaviconURL != purpleURL)
    {
        // set to default red color
        return "red";
    }

    /* cycle through colors */
    switch(currentFaviconURL)
    {
        case redURL:
            return "green";
        case greenURL:
            return "blue";
        case blueURL:
            return "yellow";
        case yellowURL:
            return "orange";
        case orangeURL:
            return "purple";
        // cycle back to red
        case purpleURL:
            return "red";
        default:
            return;
    }
}

/* sets favicon url */
function setFaviconURL(color)
{
    var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    
    switch(color)
    {
        case "red":
            link.href = chrome.runtime.getURL("img/red-circle-16.png");
            break;
        case "green":
            link.href = chrome.runtime.getURL("img/green-circle-16.png");
            break;
        case "blue":
            link.href = chrome.runtime.getURL("img/blue-circle-16.png");
            break;
        case "yellow":
            link.href = chrome.runtime.getURL("img/yellow-circle-16.png");
            break;
        case "orange":
            link.href = chrome.runtime.getURL("img/orange-circle-16.png");
            break;
        case "purple":
            link.href = chrome.runtime.getURL("img/purple-circle-16.png");
            break;
        default:
            break;
    }
}

function setFaviconURLFromURL(colorURL)
{
    var redURL = chrome.runtime.getURL("img/red-circle-16.png");
    var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
    var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

    var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    
    switch(colorURL)
    {
        case redURL:
            link.href = chrome.runtime.getURL("img/red-circle-16.png");
            break;
        case greenURL:
            link.href = chrome.runtime.getURL("img/green-circle-16.png");
            break;
        case blueURL:
            link.href = chrome.runtime.getURL("img/blue-circle-16.png");
            break;
        case yellowURL:
            link.href = chrome.runtime.getURL("img/yellow-circle-16.png");
            break;
        case orangeURL:
            link.href = chrome.runtime.getURL("img/orange-circle-16.png");
            break;
        case purpleURL:
            link.href = chrome.runtime.getURL("img/purple-circle-16.png");
            break;
        default:
            break;
    }
}

function checkFaviconURL(menuItem, tabID)
{
    console.log("tabID: " + tabID);
    // current favicon url of page
    var currentFaviconURL = document.querySelector("link[rel*='shortcut icon']").href;
    var redURL = chrome.runtime.getURL("img/red-circle-16.png");
    var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
    var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");

    switch(menuItem)
    {
        case "red":
            chrome.tabs.get(tabID, function ()
            {
                alert(tabID.querySelector("link[rel*='shortcut icon']").href);
                if (tabID.querySelector("link[rel*='shortcut icon']").href == redURL)
                {
                    alert(chrome.tabs.remove(tabID));
                    chrome.tabs.remove(tabID);
                }
            })
            break;
    }
}