/* sets tab title */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    /* title from command/saved title, custom title from popup text field, creating tabs with title */
    if (request.title || request.name || request.getTitle)
    {
        document.title = request.title || request.name || request.getTitle;
    }
    /* command for left/right key */
    else if (request.command)
    {
        var color;

        /* determine correct color from left/right key command */
        if (request.command == "left-key-toggle-feature")
        {
            console.log("left key");
            color = leftArrowKeyTabColor();
        }
        else
        {
            color = rightArrowKeyTabColor();
        }

        setFaviconURL(color);
    }
    /* popup color button press */
    else if (request.button == "buttonPress")
    {
        // set favicon url according to button color
        setFaviconURL(request.color);
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
    }
}