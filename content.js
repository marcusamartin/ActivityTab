/* sets tab title */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    /* title from command/saved title, custom title from popup text field, creating tabs with title */
    if (request.title || request.name || request.getTitle)
    {
        document.title = request.title || request.name || request.getTitle;
    }
    else if (request.command)
    {
        var color;

        /* determine correct color */
        if (request.command == "left-key-toggle-feature")
        {
            color = leftArrowKeyTabColor();
        }
        else
        {
            color = rightArrowKeyTabColor();
        }

        /* to show console, right click extension's browser icon and inspect popup */
        console.log("color: " + color);
        console.log("url: " + request.url);
        // current favicon url of page
        console.log("shortcuticon: " + document.querySelector("link[rel*='shortcut icon']").href);

        var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";

        /* set favicon url */
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
    else if (request.button == "buttonPress")
    {
        var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";

        /* set favicon url */
        switch(request.color)
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
})

/* left arrow key: returns correct tab color by looking at favicon url */
function leftArrowKeyTabColor()
{
    // current favicon url of page
    var currentFaviconURL = document.querySelector("link[rel*='shortcut icon']").href;
    var red = chrome.runtime.getURL("img/red-circle-16.png");
    var green = chrome.runtime.getURL("img/green-circle-16.png");
    var blue = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellow = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orange = chrome.runtime.getURL("img/orange-circle-16.png");
    var purple = chrome.runtime.getURL("img/purple-circle-16.png");

    /* sets favicon url depending on current favicon url */
    if (currentFaviconURL != red && currentFaviconURL != green && currentFaviconURL != blue &&
        currentFaviconURL != yellow && currentFaviconURL != orange && currentFaviconURL != purple)
    {
        // set to default red color
        return "red";
    }
    /* cycle through colors */
    else if (currentFaviconURL == purple)
    {
        return "orange";
    }
    else if (currentFaviconURL == orange)
    {
        return "yellow";
    }
    else if (currentFaviconURL == yellow)
    {
        return "blue";
    }
    else if (currentFaviconURL == blue)
    {
        return "green";
    }
    else if (currentFaviconURL == green)
    {
        return "red";
    }
    else if (currentFaviconURL == red)
    {
        // cycle back to purple
        return "purple";
    }
}

/* right arrow key: returns correct tab color by looking at favicon url */
function rightArrowKeyTabColor()
{
    // current favicon url of page
    var currentFaviconURL = document.querySelector("link[rel*='shortcut icon']").href;
    var red = chrome.runtime.getURL("img/red-circle-16.png");
    var green = chrome.runtime.getURL("img/green-circle-16.png");
    var blue = chrome.runtime.getURL("img/blue-circle-16.png");
    var yellow = chrome.runtime.getURL("img/yellow-circle-16.png");
    var orange = chrome.runtime.getURL("img/orange-circle-16.png");
    var purple = chrome.runtime.getURL("img/purple-circle-16.png");

    /* sets favicon url depending on current favicon url */
    if (currentFaviconURL != red && currentFaviconURL != green && currentFaviconURL != blue &&
        currentFaviconURL != yellow && currentFaviconURL != orange && currentFaviconURL != purple)
    {
        // set to default red color
        return "red";
    }
    /* cycle through colors */
    else if (currentFaviconURL == red)
    {
        return "green";
    }
    else if (currentFaviconURL == green)
    {
        return "blue";
    }
    else if (currentFaviconURL == blue)
    {
        return "yellow";
    }
    else if (currentFaviconURL == yellow)
    {
        return "orange";
    }
    else if (currentFaviconURL == orange)
    {
        return "purple";
    }
    else if (currentFaviconURL == purple)
    {
        // cycle back to red
        return "red";
    }
}