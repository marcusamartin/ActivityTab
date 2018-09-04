/* sets tab title and tab color */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    /* title from command/saved title, title from popup text field, creating tabs with title */
    if (request.title || request.name || request.getTitle)
    {
        document.title = request.title || request.name || request.getTitle;
    }
    /* color from SAVED color */
    else if (request.color)
    {
        // set favicon url according to button color
        setFaviconURL(request.color);
    }
    /* color from command */
    // request.getColor == actual favicon url
    else if (request.getColor)
    {
        // set favicon url according to url
        setFaviconURLFromURL(request.getColor);
    }
    /* command for left/right key */
    else if (request.command)
    {
        // used to set the tab color
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

        // sends color to background script for color to persist through tab refresh */
        chrome.runtime.sendMessage(color, function(response){});
    }
    /* popup color button press */
    else if (request.button == "buttonPress")
    {
        setFaviconURL(request.color);
    }
})

/* left arrow key: returns correct tab color by looking at favicon url */
function leftArrowKeyTabColor()
{
    // current favicon url of page
    var currentFaviconURL = document.querySelector("link[rel*='shortcut icon']").href;
    /* urls of color favicons */
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
        // set default color if tab had no previous color
        return "purple";
    }

    /* cycle through colors */
    switch (currentFaviconURL)
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
    /* urls of color favicons */
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
        // set default color if tab had no previous color
        return "red";
    }

    /* cycle through colors */
    switch (currentFaviconURL)
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

/* sets favicon url from a color */
function setFaviconURL(color)
{
    /* finds the tab's current favicon by DOM */
    var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    
    /* sets tab's color according to specified color */
    switch (color)
    {
        case "red":
            // changes sort tab's popup text placeholder to correct color
            chrome.runtime.sendMessage({msg: "color command"});
            // updates "sameColorTabs" context menu if command that changes color is used
            chrome.runtime.sendMessage("red", function(response){});
            // updates favicon of tab to specified color
            link.href = chrome.runtime.getURL("img/red-circle-16.png");
            break;
        case "green":
            chrome.runtime.sendMessage({msg: "color command"});
            chrome.runtime.sendMessage("green", function(response){});
            link.href = chrome.runtime.getURL("img/green-circle-16.png");
            break;
        case "blue":
            chrome.runtime.sendMessage({msg: "color command"});
            chrome.runtime.sendMessage("blue", function(response){});
            link.href = chrome.runtime.getURL("img/blue-circle-16.png");
            break;
        case "yellow":
            chrome.runtime.sendMessage({msg: "color command"});
            chrome.runtime.sendMessage("yellow", function(response){});
            link.href = chrome.runtime.getURL("img/yellow-circle-16.png");
            break;
        case "orange":
            chrome.runtime.sendMessage({msg: "color command"});
            chrome.runtime.sendMessage("orange", function(response){});
            link.href = chrome.runtime.getURL("img/orange-circle-16.png");
            break;
        case "purple":
            chrome.runtime.sendMessage({msg: "color command"});
            chrome.runtime.sendMessage("purple", function(response){});
            link.href = chrome.runtime.getURL("img/purple-circle-16.png");
            break;
        default:
            break;
    }
}

/* sets favicon url from a url */
function setFaviconURLFromURL(colorURL)
{
    /* finds the tab's current favicon by DOM */
    var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";

    /* urls of color favicons */
    var redURL = chrome.runtime.getURL("img/red-circle-16.png");
    var greenURL = chrome.runtime.getURL("img/green-circle-16.png");
    var blueURL = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orangeURL = chrome.runtime.getURL("img/orange-circle-16.png");
    var purpleURL = chrome.runtime.getURL("img/purple-circle-16.png");
    
    /* sets tab's color according to specified color */
    switch (colorURL)
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