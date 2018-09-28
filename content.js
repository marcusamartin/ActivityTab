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
        console.log("request.color");
        console.log("request.tabid: " + request.tabid);
        setFaviconURL(request.color, request.tabid);
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
        else if (request.command == "right-key-toggle-feature")
        {
            color = rightArrowKeyTabColor();
        }

        console.log('request.command');
        setFaviconURL(color);

        // sends the color to the background script so that the tab's color can persist through a tab refresh */
        console.log("runtime sending message2 color: " + color);
        console.log("command, request.tabid: " + request.tabid);
        chrome.runtime.sendMessage({color: color, tabid: request.tabid}, function(response){});
    }
    /* popup color button was pressed */
    else if (request.button == "buttonPress")
    {
        console.log('buttonpress');
        setFaviconURL(request.color);
    }
    /* changes "Save [COLOR] Tabs" context menu's text based on the current tab's color */
    else if (request.changeContextMenu)
    {
        // gets all selectors of "icon"
        var link = document.querySelectorAll("link[rel*='icon']");

        /* gets all selectors of "shortcut icon" if there are no selectors for "icon" (some websites use "icon" and others use shortcut icon") */
        if (link.length == 0)
        {
            link = document.querySelectorAll("link[rel*='shortcut icon']");

            /* did not find link for "icon" or "shortcut icon" (ex: Google) */
            // if (link.length == 0)
            // {
            //     link = document.createElement("link");
            //     link.type = "image/x-icon";
            //     link.rel = "shortcut icon";
            // }
        }

        // stores the color for the tab
        console.log("request.tabid: " + request.tabid + ", color: " + color);
        var color = changeContextMenu(link);
        console.log("after request, color: " + color);

        /* sends the color to the background script to change the context menu */
        // does not send color if message is sent from onUpdated because if a colored tab was launched, then the current tab would
        // have the launched tab color stored
        if (request.onUpdated != "onUpdated" && request.onActivate != "onActivate")
        {
            console.log("HELLOHELLO");
            console.log("runtime sending message3 color: " + color + ", tabid: " + request.tabid);
            if (color)
            {
                chrome.runtime.sendMessage({color: color, tabid: request.tabid}, function(response){});
            }
            console.log("runtime sending message3 color done");
        }
    }
})

/* left arrow key: returns the correct (changed) color by looking at the current tab's favicon url */
function leftArrowKeyTabColor()
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

    /* did not find link for "icon" or "shortcut icon" (ex: Google) */
    if (link.length == 0 || link.length == undefined)
    {
        return "purple";
    }
    /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
    else
    {
        for (var i = 0; i < link.length; i++)
        {
            /* cycle through the colors */
            switch (link[i].href)
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
                    console.log("RED HERE1");
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

    /* did not find link for "icon" or "shortcut icon" (ex: Google) */
    if (link.length == 0 || link.length == undefined)
    {
        console.log("RED HERE2");
        return "red";
    }
    /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
    else
    {
        for (var i = 0; i < link.length; i++)
        {
            /* cycle through the colors */
            switch (link[i].href)
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
                    console.log("REDHERE4");
                    return "red";
                // tab is uncolored
                default:
                    console.log("REDHERE5");
                    return "red";
            }
        }
    }
}

/* sets the tab's favicon url by a specified color */
function setFaviconURL(color, tabid)
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
    
    /* sets the tab's color according to the specified color */
    switch (color)
    {
        case "red":
            console.log("REHERE6");
            console.log(tabid);
            setColor(color, link, "img/red_circle_16.png", tabid);
            break;
        case "green":
            setColor(color, link, "img/green_circle_16.png");
            break;
        case "blue":
            setColor(color, link, "img/blue_circle_16.png");
            break;
        case "yellow":
            setColor(color, link, "img/yellow_circle_16.png");
            break;
        case "orange":
            setColor(color, link, "img/orange_circle_16.png");
            break;
        case "purple":
            setColor(color, link, "img/purple_circle_16.png");
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
            console.log('REDHERE8');
            setColorURL(link, redURL);
            break;
        case greenURL:
            setColorURL(link, greenURL);
            break;
        case blueURL:
            setColorURL(link, blueURL);
            break;
        case yellowURL:
            setColorURL(link, yellowURL);
            break;
        case orangeURL:
            setColorURL(link, orangeURL);
            break;
        case purpleURL:
            setColorURL(link, purpleURL);
            break;
        default:
            break;
    }
}

/* updates the context menu to reflect the current color of the tab */
function changeContextMenu(link)
{
    /* urls of color favicons */
    var redURL = chrome.runtime.getURL("img/red_circle_16.png");
    var greenURL = chrome.runtime.getURL("img/green_circle_16.png");
    var blueURL = chrome.runtime.getURL("img/blue_circle_16.png");
    var yellowURL = chrome.runtime.getURL("img/yellow_circle_16.png");
    var orangeURL = chrome.runtime.getURL("img/orange_circle_16.png");
    var purpleURL = chrome.runtime.getURL("img/purple_circle_16.png");

    // link was created
    if (link.length == undefined)
    {
        // color set to none since there is no set color for the tab since there would be "shortcut icon" if there was
        console.log("SETTING EMPTY");
        // return "none";
        return "";
    }
    else
    {
        for (var i = 0; i < link.length; i++)
        {
            /* find the color of the tab */
            switch(link[i].href)
            {
                case redURL:
                    console.log("REDHERE9");
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
                    // console.log("SETTING NONE");
                    // return "none";
            }
        }
    }
}

/* sets the tab's color according to the specified color */
function setColor(color, link, url, tabid)
{
    console.log("runtime sending color: " + color + "for tabid: " + tabid);
    // updates "Save [COLOR] Tabs" context menu
    if (tabid)
    {
        console.log("SENDING COLOR: " + color + " FOR TAB ID: " + tabid);
        chrome.runtime.sendMessage({color: color, tabid: tabid}, function(response){});
    }
    // chrome.runtime.sendMessage(color, function(response){});

    // link was created
    if (link.length == undefined)
    {
        // updates the tab's favicon to the specified color
        link.href = chrome.runtime.getURL(url);
        // appends the link to the document's head so that favicon will be registered by the document
        document.head.appendChild(link);
    }
    else
    {
        /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
        for (var i = 0; i < link.length; i++)
        {
            // updates favicon of tab to specified color
            link[i].href = chrome.runtime.getURL(url);
        }
    }
}

function setColorURL(link, url)
{
    // link was created
    if (link.length == undefined)
    {
        // updates the tab's favicon to the specified color
        link.href = url;
        // appends the link to the document's head so that favicon will be registered by the document
        document.head.appendChild(link);
    }
    else
    {
        /* changes all selectors of either "icon" or "shortcut icon" to new favicon */
        for (var i = 0; i < link.length; i++)
        {
            // updates favicon of tab to specified color
            link[i].href = url;
        }
    }
}