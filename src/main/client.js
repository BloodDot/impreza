exports.init = function (mainWindow) {
    const ipcMain = require('electron').ipcMain;
    const dialog = require('electron').dialog;
    const fs = require('fs');

    const removeSpaces = require('strman').removeSpaces;
    const replace = require('strman').replace;
    const substr = require('strman').substr;
    const toStudlyCaps = require('strman').toStudlyCaps;

    let win2ctrl = "/assets/script/game/constant/Win2CtrlConst.ts";

    // 对Date的扩展，将 Date 转化为指定格式的String   
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
    // 例子：   
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
    function dateFormat(date, fmt) { //author: meizz   
        let o = {
            "M+": date.getMonth() + 1,                 //月份   
            "d+": date.getDate(),                    //日   
            "h+": date.getHours(),                   //小时   
            "m+": date.getMinutes(),                 //分   
            "s+": date.getSeconds(),                 //秒   
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
            "S": date.getMilliseconds()             //毫秒   
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    ipcMain.on('open_client_project_path', function (event) {
        dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        }, function (files) {
            if (files) {
                event.sender.send('selected_client_project_path', files);
            }
        })
    })

    ipcMain.on('open_client_proto_path', function (event) {
        dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        }, function (files) {
            event.sender.send('selected_client_proto_path', files);
        })
    })

    ipcMain.on('client_init', function (event) {
        if (global.sharedObject.client_modules.length != 0) {
            return;
        }
        if (!global.sharedObject.client_project_path) {
            return
        }
        refreshModules(event, 1);
    }.bind(this))

    ipcMain.on('client_module_refresh', function (event) {
        if (!global.sharedObject.client_project_path) {
            return
        }
        refreshModules(event, 2);
    }.bind(this))

    ipcMain.on('client_create_module', function (event, module_name, module_cn_name) {
        createModule(event, module_name, module_cn_name);
    }.bind(this));

    ipcMain.on('client_create_window', function (event, window_name, window_cn_name, window_module_name) {
        createWindow(event, window_name, window_cn_name, window_module_name);
    }.bind(this));

    ipcMain.on('client_show_message', function (event, msg) {
        mainWindow.webContents.send("client_show_message", msg);
    }.bind(this));

    function refreshModules(event, type) {
        switch (type) {
            case 1:
                break;
            case 2:
                global.sharedObject.client_modules = [];
                break;
            default:
                break;
        }

        fs.readFile(global.sharedObject.client_project_path + win2ctrl, 'utf8', function (err, data) {
            let datas = data.split("=");
            let datastr = replace(replace(removeSpaces(datas[1]), "\r", ""), "\n", "");
            datastr = substr(datastr, 1, datastr.length - 5);
            let modules = global.sharedObject.modules = datastr.split("},");
            for (let i = 0; i < modules.length; i++) {
                let module = {};

                let moduleStruct = substr(modules[i], 1, module.length)
                let moduleStructArr = moduleStruct.split("ctrl:");
                let moduleName = moduleStructArr[0].split(",")[0].split(".")[1];
                moduleStructArr = moduleStructArr[1].split("wins:");
                let ctrlName = moduleStructArr[0].split(",")[0].split(".")[1];

                module.moduleName = moduleName;
                module.ctrlName = ctrlName;
                module.windows = [];

                let windowStruct = moduleStructArr[1];
                windowStruct = substr(windowStruct, 1, windowStruct.length - 2);
                let windows = windowStruct.split(",");
                for (let m = 0; m < windows.length; m++) {
                    module.windows.push(windows[m]);
                }

                global.sharedObject.client_modules.push(module);
            }

            switch (type) {
                case 1:
                    event.sender.send('client_init_complete', global.sharedObject.client_modules);
                    break;
                case 2:
                    event.sender.send('client_module_refresh_complete', global.sharedObject.client_modules);
                    break;
                default:
                    break;
            }
        });
    }

    function createModule(event, module_name, module_cn_name) {
        fs.mkdirSync(global.sharedObject.client_project_path + "/assets/script/game/module/" + module_name);
        fs.mkdirSync(global.sharedObject.client_project_path + "/assets/script/game/module/" + module_name + "/controller");
        fs.mkdirSync(global.sharedObject.client_project_path + "/assets/script/game/module/" + module_name + "/model");
        fs.mkdirSync(global.sharedObject.client_project_path + "/assets/script/game/module/" + module_name + "/view");
        fs.mkdirSync(global.sharedObject.client_project_path + "/assets/resources/prefabs/game/" + module_name);

        let author = global.sharedObject.client_author;

        //----------创建控制器
        let cpath = global.sharedObject.client_project_path + "/assets/script/game/module/" + module_name + "/controller/" + toStudlyCaps(module_name) + "Controller.ts";
        if (fs.exists(cpath, function (exists) {
            if (exists) {
                let msg = toStudlyCaps(module_name) + "Controller.ts" + "已存在";
                mainWindow.webContents.send("client_show_message", msg);
            } else {
                let ccontent = "import BController from '../../../../framework/mvc/controller/BController';\r\n\r\nconst { ccclass, property } = cc._decorator;\r\n/**\r\n * @author " + author + "\r\n * @desc " + module_cn_name + "控制器\r\n * @date " + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + "\r\n * @last modified by   " + author + " \r\n * @last modified time " + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + "\r\n*/\r\n@ccclass\r\nexport default class " + toStudlyCaps(module_name) + "Controller extends BController {\r\n\tpublic constructor() {\r\n\t\tsuper();\r\n\t}\r\n\r\n\tpublic static getClass() {\r\n\t\treturn this.constructor;\r\n\t}\r\n}";
                fs.writeFile(cpath, ccontent, function (err) {
                    if (!err) {
                        let msg = "创建" + toStudlyCaps(module_name) + "Controller.ts" + "成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        }));


        //----------创建数据模型
        let mpath = global.sharedObject.client_project_path + "/assets/script/game/module/" + module_name + "/model/" + toStudlyCaps(module_name) + "Model.ts";
        if (fs.exists(mpath, function (exists) {
            if (exists) {
                let msg = toStudlyCaps(module_name) + "Model.ts" + "已存在";
                mainWindow.webContents.send("client_show_message", msg);
            } else {
                let mcontent = "import BModel from '../../../../framework/mvc/model/BModel'; \r\n\r\n/**\r\n * @author " + author + "\r\n * @desc " + module_cn_name + " 数据模型\r\n * @date " + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + " \r\n * @last modified by   " + author + "  \r\n * @last modified time " + dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss") + "\r\n */\r\nexport default class " + toStudlyCaps(module_name) + "Model extends BModel {\t\r\n\tpublic constructor() {\t\r\n\t\tsuper();\t\r\n\t}\r\n}";
                fs.writeFile(mpath, mcontent, function (err) {
                    if (!err) {
                        let msg = "创建" + toStudlyCaps(module_name) + "Model.ts" + "成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        }));

        //----------创建窗体
        let wpath = global.sharedObject.client_project_path + "/assets/script/game/module/" + module_name + "/view/" + toStudlyCaps(module_name) + "Window.ts";
        if (fs.exists(wpath, function (exists) {
            if (exists) {
                let msg = toStudlyCaps(module_name) + "Window.ts" + "已存在";
                mainWindow.webContents.send("client_show_message", msg);
            } else {
                let wcontent = "import BWindow from '../../../../framework/mvc/view/BWindow';\r\n\r\nconst { ccclass, property } = cc._decorator;\r\n/**\r\n * @author " + author + " \r\n * @desc " + module_cn_name + " 窗体\r\n * @date " + dateFormat(new Date(), "yyyy-MM - dd hh: mm:ss") + " \r\n * @last modified by   " + author + " \r\n * @last modified time " + dateFormat(new Date(), "yyyy-MM - dd hh: mm:ss") + " \r\n */\r\n@ccclass\r\nexport default class " + toStudlyCaps(module_name) + "Window extends BWindow {\r\n\tpublic constructor() {\r\n\t\tsuper();\r\n\t}\r\n\r\n\tpublic show(data?: any): void {\r\n\t\tsuper.show();\r\n\t}\r\n\r\n\tpublic hide(data?: any): void {\r\n\t\tsuper.hide();\r\n\t}\r\n\r\n\tpublic onDestroy(): void {\r\n\t\tsuper.onDestroy();\r\n\t}\r\n}";
                fs.writeFile(wpath, wcontent, function (err) {
                    if (!err) {
                        let msg = "创建" + toStudlyCaps(module_name) + "Window.ts" + "成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        }));

        //----------创建窗体预置体
        // let vcontent = '[\r\n  {\r\n    "__type__": "cc.Prefab",\r\n    "_name": "",\r\n    "_objFlags": 0,\r\n    "_rawFiles": null,\r\n    "data": {\r\n      "__id__": 1\r\n    }\r\n  },\r\n  {\r\n    "__type__": "cc.Node",\r\n    "_name": "' + toStudlyCaps(module_name) + 'WindowPrefab",\r\n    "_objFlags": 0,\r\n    "_parent": null,\r\n    "_children": [],\r\n    "_tag": -1,\r\n    "_active": true,\r\n    "_components": [],\r\n    "_prefab": {\r\n      "__id__": 2\r\n    },\r\n    "_id": "",\r\n    "_opacity": 255,\r\n    "_color": {\r\n      "__type__": "cc.Color",\r\n      "r": 255,\r\n      "g": 255,\r\n      "b": 255,\r\n      "a": 255\r\n    },\r\n    "_cascadeOpacityEnabled": true,\r\n    "_anchorPoint": {\r\n      "__type__": "cc.Vec2",\r\n      "x": 0.5,\r\n      "y": 0.5\r\n    },\r\n    "_contentSize": {\r\n      "__type__": "cc.Size",\r\n      "width": 0,\r\n      "height": 0\r\n    },\r\n    "_rotationX": 0,\r\n    "_rotationY": 0,\r\n    "_scaleX": 1,\r\n    "_scaleY": 1,\r\n    "_position": {\r\n      "__type__": "cc.Vec2",\r\n      "x": 0,\r\n      "y": 0\r\n    },\r\n    "_skewX": 0,\r\n    "_skewY": 0,\r\n    "_localZOrder": 0,\r\n    "_globalZOrder": 0,\r\n    "_opacityModifyRGB": false,\r\n    "groupIndex": 0\r\n  },\r\n  {\r\n    "__type__": "cc.PrefabInfo",\r\n    "root": {\r\n      "__id__": 1\r\n    },\r\n    "asset": {\r\n      "__id__": 0\r\n    },\r\n    "fileId": "",\r\n    "sync": false\r\n  }\r\n]';
        // fs.writeFileSync(global.sharedObject.client_project_path + "/assets/resources/prefabs/game/" + module_name + "/" + toStudlyCaps(module_name) + "WindowPrefab.prefab", vcontent, function (err) {
        // 	if (!err) {
        // 		console.log("创建窗体预置体成功");
        // 	}
        // });

        //----------修改ModuleConst
        let mdpath = global.sharedObject.client_project_path + "/assets/script/game/constant/ModuleConst.ts";
        fs.readFile(mdpath, "utf8", function (err, data) {
            if (!err) {
                let mdcontent = substr(data, 0, data.length - 1);
                mdcontent = mdcontent + "\tpublic static " + module_name + ": string = \"" + module_name + "\";\n}";

                fs.writeFile(mdpath, mdcontent, function (err) {
                    if (!err) {
                        let msg = "修改ModuleConst成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        });

        //----------修改WindowConst
        let wcpath = global.sharedObject.client_project_path + "/assets/script/game/constant/WindowConst.ts";
        fs.readFile(wcpath, "utf8", function (err, data) {
            if (!err) {
                let wccontent = substr(data, 0, data.length - 1);
                wccontent = wccontent + "\tpublic static " + toStudlyCaps(module_name) + "Window: string = \"" + toStudlyCaps(module_name) + "Window\";\n}";

                fs.writeFile(wcpath, wccontent, function (err) {
                    if (!err) {
                        let msg = "修改WindowConst成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        });

        //-----------修改CtrlConst
        let ccpath = global.sharedObject.client_project_path + "/assets/script/game/constant/CtrlConst.ts";
        fs.readFile(ccpath, "utf8", function (err, data) {
            if (!err) {
                let cccontent = substr(data, 0, data.length - 1);
                cccontent = "import " + toStudlyCaps(module_name) + "Controller from '../module/" + module_name + "/controller/" + toStudlyCaps(module_name) + "Controller';\n" + cccontent;
                cccontent = cccontent + "\tpublic static " + toStudlyCaps(module_name) + "Controller = " + toStudlyCaps(module_name) + "Controller;\n}";

                fs.writeFile(ccpath, cccontent, function (err) {
                    if (!err) {
                        let msg = "修改CtrlConst成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        });

        //-----------修改Win2CtrlConst
        let wccpath = global.sharedObject.client_project_path + "/assets/script/game/constant/Win2CtrlConst.ts";
        fs.readFile(wccpath, "utf8", function (err, data) {
            if (!err) {
                let wcccontent = substr(data, 0, data.length - 5);
                wcccontent = "import " + toStudlyCaps(module_name) + "Controller from '../module/" + module_name + "/controller/" + toStudlyCaps(module_name) + "Controller';\n" + wcccontent;
                wcccontent = "import " + toStudlyCaps(module_name) + "Window from '../module/" + module_name + "/view/" + toStudlyCaps(module_name) + "Window';\n" + wcccontent;
                wcccontent = wcccontent + "\n\t\t{\n\t\t\tmodule: ModuleConst." + module_name + ",\n\t\t\tctrl: CtrlConst." + toStudlyCaps(module_name) + "Controller,\n\t\t\twins: [\n\t\t\t\tWindowConst." + toStudlyCaps(module_name) + "Window\n\t\t\t]\n\t\t},";
                wcccontent = wcccontent + "\n\t];\n}";
                fs.writeFile(wccpath, wcccontent, function (err) {
                    if (!err) {
                        let msg = "修改Win2CtrlConst成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        });

        //刷新模块列表
        setTimeout(function () {
            refreshModules(event, 2);
        }, 500);
    }

    function createWindow(event, window_name, window_cn_name, window_module_name) {
        let author = global.sharedObject.client_author;

        //----------创建窗体
        let wpath = global.sharedObject.client_project_path + "/assets/script/game/module/" + window_module_name + "/view/" + toStudlyCaps(window_name) + "Window.ts";
        if (fs.exists(wpath, function (exists) {
            if (exists) {
                let msg = toStudlyCaps(window_name) + "Window.ts" + "已存在";
                mainWindow.webContents.send("client_show_message", msg);
            } else {
                let wcontent = "import BWindow from '../../../../framework/mvc/view/BWindow';\r\n\r\nconst { ccclass, property } = cc._decorator;\r\n/**\r\n * @author " + author + " \r\n * @desc " + window_cn_name + " 窗体\r\n * @date " + dateFormat(new Date(), "yyyy-MM - dd hh: mm:ss") + " \r\n * @last modified by   " + author + " \r\n * @last modified time " + dateFormat(new Date(), "yyyy-MM - dd hh: mm:ss") + " \r\n */\r\n@ccclass\r\nexport default class " + toStudlyCaps(window_name) + "Window extends BWindow {\r\n\tpublic constructor() {\r\n\t\tsuper();\r\n\t}\r\n\r\n\tpublic show(data?: any): void {\r\n\t\tsuper.show();\r\n\t}\r\n\r\n\tpublic hide(data?: any): void {\r\n\t\tsuper.hide();\r\n\t}\r\n\r\n\tpublic onDestroy(): void {\r\n\t\tsuper.onDestroy();\r\n\t}\r\n}";
                fs.writeFile(wpath, wcontent, function (err) {
                    if (!err) {
                        let msg = "创建" + toStudlyCaps(window_name) + "Window.ts" + "成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        }));

        //----------修改WindowConst
        let wcpath = global.sharedObject.client_project_path + "/assets/script/game/constant/WindowConst.ts";
        fs.readFile(wcpath, "utf8", function (err, data) {
            if (!err) {
                let wccontent = substr(data, 0, data.length - 1);
                wccontent = wccontent + "\tpublic static " + toStudlyCaps(window_name) + "Window: string = \"" + toStudlyCaps(window_name) + "Window\";\n}";

                fs.writeFile(wcpath, wccontent, function (err) {
                    if (!err) {
                        let msg = "修改WindowConst成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        });

        //-----------修改Win2CtrlConst
        let wccpath = global.sharedObject.client_project_path + "/assets/script/game/constant/Win2CtrlConst.ts";
        fs.readFile(wccpath, "utf8", function (err, data) {
            if (!err) {
                let datas = data.split("ModuleConst." + window_module_name);
                let preData = datas[0];
                let nexDatas = datas[1].split("[");
                let preString = datas[0] + "ModuleConst." + window_module_name + nexDatas[0] + "[";

                endString = "\n\t\t\t\tWindowConst." + toStudlyCaps(window_name) + "Window," + nexDatas[1];

                let wcccontent = preString + endString;
                wcccontent = "import " + toStudlyCaps(window_name) + "Window from '../module/" + window_module_name + "/view/" + toStudlyCaps(window_name) + "Window';\n" + wcccontent;
                fs.writeFile(wccpath, wcccontent, function (err) {
                    if (!err) {
                        let msg = "修改Win2CtrlConst成功";
                        mainWindow.webContents.send("client_show_message", msg);
                    }
                });
            }
        });

        //刷新模块列表
        setTimeout(function () {
            refreshModules(event, 2);
        }, 500);
    }

    global.sharedObject = {
        client_author: "",
        client_project_path: "",
        client_proto_path: "",
        client_modules: []
    }
}