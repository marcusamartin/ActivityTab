/* sets the title and color of the tab */
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

        /* determine the correct color for the tab from the left/right key command */
        if (request.command == "left-key-toggle-feature")
        {
            color = leftArrowKeyTabColor();
        }
        else
        {
            color = rightArrowKeyTabColor();
        }

        setFaviconURL(color);

        // sends the color to the background script so that the tab's color can persist through a tab refresh */
        chrome.runtime.sendMessage(color, function(response){});
    }
    /* popup color button was pressed */
    else if (request.button == "buttonPress")
    {
        setFaviconURL(request.color);
    }
    /* changes "Save [COLOR] Tabs" context menu's text based on the current tab's color */
    else if (request.changeContextMenu)
    {
        // gets all selectors of "icon"
        var currentFaviconURL = document.querySelectorAll("link[rel*='icon']");

        /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
        if (currentFaviconURL.length == 0)
        {
            currentFaviconURL = document.querySelectorAll("link[rel*='shortcut icon']");

            /* did not find link for "icon" or "shortcut icon" (ex: Google) */
            if (currentFaviconURL.length == 0)
            {
                currentFaviconURL = document.createElement("link");
                currentFaviconURL.type = "image/x-icon";
                currentFaviconURL.rel = "shortcut icon";
            }
        }

        // stores the color of the tab
        var color = changeContextMenu(currentFaviconURL);

        /* sends the color to the background script to change the context menu */
        // does not send color if sent from onUpdated because if a colored tab was launched, then the current tab would
        // have the launched tab color stored
        if (request.onUpdated != "onUpdated")
        {
            chrome.runtime.sendMessage(color, function(response){});
        }
    }
    else if (request.highlightCommand)
    {
        var color;
        /* urls of color favicons */
        var redURL = chrome.runtime.getURL("img/red_circle_16.png");
        var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
        var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
        var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
        var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
        var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

        // specified tab (specified by tab id in background script) in highlighted tabs
        var tab = request.highlightedTabs;
    
        if (request.highlightCommand == "left-key-toggle-feature")
        {
            switch(tab.favIconUrl)
            {
                case redURL:
                    // change favicon url
                    tab.favIconUrl = purpleURL;
                    // specify color to change "Save [COLOR] Tabs" text field's border color
                    color = "purple;"
                    break;
                case greenURL:
                    tab.favIconUrl = redURL;
                    color = "red";
                    break;
                case blueURL:
                    tab.favIconUrl = greenURL;
                    color = "green";
                    break;
                case yellowURL:
                    tab.favIconUrl = blueURL;
                    color = "blue";
                    break;
                case orangeURL:
                    tab.favIconUrl = yellowURL;
                    color = "yellow";
                    break;
                case purpleURL:
                    tab.favIconUrl = orangeURL;
                    color = "orange";
                    break;
                // no color is set
                default:
                    tab.favIconUrl = purpleURL;
                    color = "purple";
                    break;
            }

            // sends tab color to background script to change context menu
            chrome.runtime.sendMessage(color, function(response){});

            // gets all selectors of "icon"
            var currentFaviconURL = document.querySelectorAll("link[rel*='icon']");

            /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
            if (currentFaviconURL.length == 0)
            {
                currentFaviconURL = document.querySelectorAll("link[rel*='shortcut icon']");

                /* did not find link for "icon" or "shortcut icon" (ex: Google) */
                if (currentFaviconURL.length == 0)
                {
                    currentFaviconURL = document.createElement("link");
                    currentFaviconURL.type = "image/x-icon";
                    currentFaviconURL.rel = "shortcut icon";
                }
            }

            // link was created
            if (currentFaviconURL.length == undefined)
            {
                // updates favicon of tab to specified color
                currentFaviconURL.href = tab.favIconUrl;
                // append currentFaviconURL to document head so favicon will be registered by the document
                document.head.appendChild(currentFaviconURL);
            }
            else
            {
                for (var i = 0; i < currentFaviconURL.length; i++)
                {
                    // updates favicon of tab to specified color
                    currentFaviconURL[i].href = tab.favIconUrl;
                }
            }
        }
        else if (request.highlightCommand == "right-key-toggle-feature")
        {
            switch(tab.favIconUrl)
            {
                case redURL:
                    // change favicon url
                    tab.favIconUrl = greenURL;
                    // specify color to change "Save [COLOR] Tabs" text field's border color
                    color = "green;"
                    break;
                case greenURL:
                    tab.favIconUrl = blueURL;
                    color = "blue";
                    break;
                case blueURL:
                    tab.favIconUrl = yellowURL;
                    color = "yellow";
                    break;
                case yellowURL:
                    tab.favIconUrl = orangeURL;
                    color = "orange";
                    break;
                case orangeURL:
                    tab.favIconUrl = purpleURL;
                    color = "purple";
                    break;
                case purpleURL:
                    tab.favIconUrl = redURL;
                    color = "red";
                    break;
                // no color is set
                default:
                    tab.favIconUrl = redURL;
                    color = "red";
                    break;
            }

            // sends the tab's color to the background script to change the context menu
            chrome.runtime.sendMessage(color, function(response){});

            // gets all selectors of "icon"
            var currentFaviconURL = document.querySelectorAll("link[rel*='icon']");

            /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
            if (currentFaviconURL.length == 0)
            {
                currentFaviconURL = document.querySelectorAll("link[rel*='shortcut icon']");

                /* did not find link for "icon" or "shortcut icon" */
                if (currentFaviconURL.length == 0)
                {
                    currentFaviconURL = document.createElement("link");
                    currentFaviconURL.type = "image/x-icon";
                    currentFaviconURL.rel = "shortcut icon";
                }
            }

            // link was created
            if (currentFaviconURL.length == undefined)
            {
                // updates favicon of tab to specified color
                currentFaviconURL.href = tab.favIconUrl;
                // append currentFaviconURL to document head so favicon will be registered by the document
                document.head.appendChild(currentFaviconURL);
            }
            else
            {
                for (var i = 0; i < currentFaviconURL.length; i++)
                {
                    // updates favicon of tab to specified color
                    currentFaviconURL[i].href = tab.favIconUrl;
                }
            }
        }
    }
})

/* left arrow key: returns the correct (changed) color by looking at the current tab's favicon url */
function leftArrowKeyTabColor()
{
    // gets all selectors of "icon"
    var currentFaviconURL = document.querySelectorAll("link[rel*='icon']");

    /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
    if (currentFaviconURL.length == 0)
    {
        currentFaviconURL = document.querySelectorAll("link[rel*='shortcut icon']");
    }

    /* urls of color favicons */
    var redURL = chrome.runtime.getURL("img/red_circle_16.png");
	var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
	var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
	var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
	var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

    /* did not find link for "icon" or "shortcut icon" (ex: Google) */
    if (currentFaviconURL.length == 0)
    {
        return "purple";
    }
    /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
    else
    {
        for (var i = 0; i < currentFaviconURL.length; i++)
        {
            /* cycle through colors */
            switch (currentFaviconURL[i].href)
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
                // tab is uncolored
                default:
                    return "purple";
            }
        }
    }
}

/* right arrow key: returns the correct (changed) color by looking at the current tab's favicon url */
function rightArrowKeyTabColor()
{
    // gets all selectors of "icon"
    var currentFaviconURL = document.querySelectorAll("link[rel*='icon']");

    /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
    if (currentFaviconURL.length == 0)
    {
        currentFaviconURL = document.querySelectorAll("link[rel*='shortcut icon']");
    }

    /* urls of color favicons */
    var redURL = chrome.runtime.getURL("img/red_circle_16.png");
	var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
	var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
	var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
	var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

    /* did not find link for "icon" or "shortcut icon" (ex: Google) */
    if (currentFaviconURL.length == 0)
    {
        return "red";
    }
    /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
    else
    {
        for (var i = 0; i < currentFaviconURL.length; i++)
        {
            /* cycle through colors */
            switch (currentFaviconURL[i].href)
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
                // tab is uncolored
                default:
                    return "red";
            }
        }
    }
}

/* sets the tab's favicon url by a specified color */
function setFaviconURL(color)
{
    // gets all selectors of "icon"
    var link = document.querySelectorAll("link[rel*='icon']");

    /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
    if (link.length == 0)
    {
        link = document.querySelectorAll("link[rel*='shortcut icon']");

        /* did not find link for "icon" or "shortcut icon" (ex: Google) */
        if (link.length == 0)
        {
            link = document.createElement("link");
            link.type = "image/x-icon";
            link.rel = "shortcut icon";
        }
    }
    
    /* sets tab's color according to specified color */
    switch (color)
    {
        case "red":
            // updates "Save [COLOR] Tabs" context menu
            chrome.runtime.sendMessage("red", function(response){});

            // link was created
            if (link.length == undefined)
            {
                // updates the tab's favicon to the specified color
                link.href = chrome.runtime.getURL("img/red_circle_16.png");
                // appends the link to the document's head so that favicon will be registered by the document
                document.head.appendChild(link);
            }
            else
            {
                /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
                for (var i = 0; i < link.length; i++)
                {
                    // updates favicon of tab to specified color
                    link[i].href = chrome.runtime.getURL("img/red_circle_16.png");
                }
            }
            break;
        case "green":
            chrome.runtime.sendMessage("green", function(response){});

            if (link.length == undefined)
            {
                link.href = chrome.runtime.getURL("img/green_circle_16.png");
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = chrome.runtime.getURL("img/green_circle_16.png");
                }
            }
            break;
        case "blue":
            chrome.runtime.sendMessage("blue", function(response){});

            if (link.length == undefined)
            {
                link.href = chrome.runtime.getURL("img/blue_circle_16.png");
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = chrome.runtime.getURL("img/blue_circle_16.png");
                }
            }
            break;
        case "yellow":
            chrome.runtime.sendMessage("yellow", function(response){});

            if (link.length == undefined)
            {
                link.href = chrome.runtime.getURL("img/yellow_circle_16.png");
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = chrome.runtime.getURL("img/yellow_circle_16.png");
                }
            }
            break;
        case "orange":
            chrome.runtime.sendMessage("orange", function(response){});

            if (link.length == undefined)
            {
                link.href = chrome.runtime.getURL("img/orange_circle_16.png");
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = chrome.runtime.getURL("img/orange_circle_16.png");
                }
            }
            break;
        case "purple":
            chrome.runtime.sendMessage("purple", function(response){});

            if (link.length == undefined)
            {
                link.href = chrome.runtime.getURL("img/purple_circle_16.png");
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = chrome.runtime.getURL("img/purple_circle_16.png");
                }
            }
            break;
        default:
            break;
    }
}

/* sets the tab's favicon url from a url */
function setFaviconURLFromURL(colorURL)
{
    // gets all selectors of "icon"
    var link = document.querySelectorAll("link[rel*='icon']");

    /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
    if (link.length == 0)
    {
        link = document.querySelectorAll("link[rel*='shortcut icon']");

        /* did not find link for "icon" or "shortcut icon" (ex: Google) */
        if (link.length == 0)
        {
            link = document.createElement("link");
            link.type = "image/x-icon";
            link.rel = "shortcut icon";
        }
    }

    /* urls of color favicons */
    var redURL = chrome.runtime.getURL("img/red_circle_16.png");
	var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
	var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
	var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
	var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
	var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

    /* sets the tab's color according to the specified color */
    switch (colorURL)
    {
        case redURL:
            // link was created
            if (link.length == undefined)
            {
                // updates the tab's favicon to the specified color
                link.href = redURL;
                // appends the link to the document's head so that favicon will be registered by the document
                document.head.appendChild(link);
            }
            else
            {
                /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
                for (var i = 0; i < link.length; i++)
                {
                    // updates favicon of tab to specified color
                    link[i].href = redURL;
                }
            }
            break;
        case greenURL:
            if (link.length == undefined)
            {
                link.href = greenURL;
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = greenURL;
                }
            }
            break;
        case blueURL:
            if (link.length == undefined)
            {
                link.href = blueURL;
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = blueURL;
                }
            }
            break;
        case yellowURL:
            if (link.length == undefined)
            {
                link.href = yellowURL;
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = yellowURL;
                }
            }
            break;
        case orangeURL:
            if (link.length == undefined)
            {
                link.href = orangeURL;
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = orangeURL;
                }
            }
            break;
        case purpleURL:
            if (link.length == undefined)
            {
                link.href = purpleURL;
                document.head.appendChild(link);
            }
            else
            {
                for (var i = 0; i < link.length; i++)
                {
                    link[i].href = purpleURL;
                }
            }
            break;
        default:
            break;
    }
}

function changeContextMenu(currentFaviconURL)
{
    /* urls of color favicons */
    var redURL = chrome.runtime.getURL("img/red_circle_16.png");
    var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
    var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
    var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
    var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

    // link was created
    if (currentFaviconURL.length == undefined)
    {
        // color set to none since there is no set color for the tab since there would be "shortcut icon" if there was
        return "none;"
    }
    else
    {
        for (var i = 0; i < currentFaviconURL.length; i++)
        {
            switch(currentFaviconURL[i].href)
            {
                case redURL:
                    return "red";
                case greenURL:
                    return "green";
                case blueURL:
                    return "blue";
                case yellowURL:
                    return "yellow";
                case orangeURL:
                    return "orange";
                case purpleURL:
                    return "purple";
                default:
                    // color set to none since there is no set color for the tab since there would be "shortcut icon" if there was
                    return "none";
            }
        }
    }
}