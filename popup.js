
/*
chrome.tabs.onCreated.addListener(function(tab){
    alert("new tab "+tab.id);
});


var createdTabId = 0;
chrome.downloads.onCreated.addListener(function(downloadItem){
	alert(downloadItem.filename);
});


if (chrome.downloads) {
	alert("downloads enabled");
}
else
{
	alert("downloads disabled");
}
*/

// chrome.downloads.onCreated.addListener(function(item){
// 	chrome.tabs.remove(createdTabId);
// 	//alert(item.finalURL + "\n" + item.referrer + "\nTabID: " + );
// 	//console.log(item.finalURL + "\n" + item.referrer);
// });

// /*
// chrome.downloads.download({
//   url: "https://developer.chrome.com/extensions/examples/api/downloads/download_manager/manifest.json"
// });
// */

// chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
//     // since only one tab should be active and in the current window at once
//     // the return variable should only have one entry
//     var activeTab = arrayOfTabs[0];
// 	var URL = activeTab.url;
//     //alert(activeTab.url); // or do whatever you need

// 	if(URL.substring(0, 32) == "https://www.youtube.com/watch?v=")
// 	{
// 		//alert(URL);
// 		var newURL = "http://peggo.co/dvr/" + URL.split("https://www.youtube.com/watch?v=")[1].split("#")[0];
// 		//alert(newURL);
// 	}
// 	//alert(document.getElementById("eow-title"));

// 	chrome.tabs.create({ url: newURL, active: false}, function(tab){
// 		//tab.id;
// 		/*
// 		setTimeout(function(){
// 			createdTabId = tab.id;
// 			download()
// 			//alert(document.getElementById("watch7-header"));
// 		}, 4000);
// 		*/
// 		createdTabId = tab.id;
// 		download()
// 	});
// 	//alert(createdTabId);
// 	//setTimeout(function(){alert(createdTabId);}, 2000);




// 	//alert(tabID);
// });

// function download()
// {
// 	chrome.tabs.executeScript(createdTabId, { file: "jquery-3.2.0.min.js" }, function() {
//     	chrome.tabs.executeScript(createdTabId, { file: "inject.js" });
// 	});
// }
Array.prototype.distinct = function ()
{
    return this.filter(function (value, index, self)
    {
        return self.indexOf(value) === index;
    });
};

var bookmarks = [];
var urls = [];
var nodes = [];

function getUrls(node)
{
    console.log(node);
    if (node.hasOwnProperty('children'))
    {
        for (var i = 0; i < node.children.length; i++)
        {
            getUrls(node.children[i]);
        }
    }
    else if (node.hasOwnProperty('url'))
    {
        urls.push(node.url);
        nodes.push(node);
    }
}

async function getWindow(windowId)
{
    return await new Promise((resolve) =>
    {
        chrome.windows.get(windowId, { populate: true }, function (window)
        {
            resolve(window);
        });
    });
}

async function visit()
{
    var newWindow = await new Promise((resolve) =>
    {
        chrome.windows.create(function (window)
        {
            console.log(window);
            resolve(window);
        });
    });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
    {
        if (changeInfo.status === 'complete')
        {
            chrome.tabs.remove(tab.id);
            console.log("removed a tab from our handler");
        }
    });

    var maxTabs = 20;
    console.log(newWindow);
    for (var i = 0; i < urls.length; i++)
    {
        try
        {
            for (; ;)
            {
                newWindow = await getWindow(newWindow.id);
                console.log("tabs: " + newWindow.tabs.length);
                console.log(newWindow);

                if (newWindow.tabs.length < maxTabs)
                {
                    chrome.tabs.create({ windowId: newWindow.id, url: urls[i], active: false },
                        function (tab)
                        {
                            setTimeout(function ()
                            {
                                chrome.tabs.remove(tab.id);
                            }, 10000);
                        });
                    break;
                } else
                {
                    await new Promise((resolve) =>
                    {
                        setTimeout(function ()
                        {
                            resolve(true);
                        }, 1000);
                    });
                }
            }
            // await new Promise((resolve) => {
            //     chrome.tabs.create({ windowId: newWindow.id, url: urls[i], active: false },
            //         function (tab)
            //         {
            //             setTimeout(function ()
            //             {
            //                 chrome.tabs.remove(tab.id);
            //                 resolve(tab.id);
            //             }, 5000);
            //         });
            // });

            console.log("Website " + i + ": " + urls[i]);
        }
        catch (error)
        {
            console.log(error);
            //ignore
        }
    }
}

chrome.bookmarks.getTree(function (bookmarkTreeNodes)
{
    bookmarks = bookmarkTreeNodes;
    console.log(bookmarkTreeNodes);
    for (var i = 0; i < bookmarkTreeNodes.length; i++)
    {
        getUrls(bookmarkTreeNodes[i]);
    }

    console.log(urls);
    visit();
    // urls = urls.distinct();
    // console.log(urls);
});