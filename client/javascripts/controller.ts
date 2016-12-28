/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../../typings/index.d.ts" />

"use strict";

namespace ControllerModule {

    const {remote} = require('electron');
    const ipc = require('electron').ipcRenderer;
    const Controllers = angular.module('Controllers', []);

    Controllers.controller('Controller', ['$scope', 'ShapeEdit',
        function ($scope: any, ShapeEdit: any): void {

            let opened = false;

            let body = document.getElementById('body');

            body.ondragover = (): boolean => {
                return false;
            };

            body.ondragleave = body.ondragend = (): boolean => {
                return false;
            };

            body.ondrop = (e): boolean => {
                e.preventDefault();
                if (!opened) {
                    let file: any = e.dataTransfer.files[0];
                    ipc.send('open', file.path);
                }
                return false;
            };



            ShapeEdit.onDrop((shape: ShapeEdit.BaseShape, e: any): void => {
                if (opened) {
                    if (e.dataTransfer.files.length == 0) {
                        var url = e.dataTransfer.getData('url');
                        if (url != "") {
                            var image = new Image();
                            image.crossOrigin = 'Anonymous';
                            // for url load error detect.
                            //image.setAttribute('crossOrigin', 'anonymous');
                            image.onload = (ex: any): void => {                            // URLがイメージとしてロード可能
                                var w = ex.target.width;
                                var h = ex.target.height;
                                let obj = {
                                    rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                                    property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                        "category": "",
                                        "type": "meter"
                                    })
                                };

                                ShapeEdit.Canvas.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                            };
                            image.onerror = (): void => {                           // URLがイメージとしてロード不可能
                            };
                            image.src = url;
                        }
                    } else {
                        let file: any = e.dataTransfer.files[0];
                        let reader: any = new FileReader();
                        reader.onload = ((theFile) => {

                            return (ex) => {
                                let img = new Image();
                                img.onload = (): void => {
                                    let w = img.width;
                                    let h = img.height;
                                    let url = ex.target.result;
                                    let obj = {
                                        rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                                        property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                            "category": "",
                                            "type": "meter"
                                        })
                                    };
                                    ShapeEdit.Canvas.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                                };
                                img.src = ex.target.result;
                            };
                        })(file);
                        reader.readAsDataURL(file);
                    }

                }
            });




            /*
             let format = {
             size: [600, 848],
             margins: { // by default, all are 72
             top: 72,
             bottom: 72,
             left: 72,
             right: 72
             },
             layout: 'portrait',
             info: {
             Title: 'title',
             Author: 'pdf_writer',
             Subject: 'test',
             Keywords: 'pdf;javascript',
             CreationDate: '10/10/2016',
             ModDate: '11/10/2016'
             }
             };

             */
//                    cover_letter.width = 600;
//                    cover_letter.height = 600;
            /*
             let content = {
             title: "",
             subtitle: "",
             text: JSON.stringify(cover_letter),
             format: format,
             };
             */


            ShapeEdit.onResizeWindow((wrapper, inner): void => {

            });

            ipc.on('new', (event: any, value: any): void => {
                $scope.$evalAsync(($scope): void => {
                    ShapeEdit.Load(value);
                    ShapeEdit.Canvas.SetMode(ShapeEdit.Mode.draw);
                    opened = true;
                    $scope.opened = opened;
                });
            });

            ipc.on('open', (event: any, value: string): void => {
                $scope.$evalAsync(($scope): void => {
                    ShapeEdit.Load(value);
                    opened = true;
                    $scope.opened = opened;
                });
            });

            ipc.on('close', (event: any, value: string): void => {
                $scope.$evalAsync(($scope): void => {
                    opened = false;
                    $scope.opened = opened;
                    ShapeEdit.load("");
                });

            });

            ipc.on('save', (event: any, msg: any): void => {  //ping-pong pattern
                ipc.send('value', ShapeEdit.Serialize());
            });

            ipc.on('add', (event: any, msg: any): void => {
                $scope.$evalAsync(($scope): void => {
                    switch (msg) {
                        case "text":
                            AddText();
                            break;
                        case "rect":
                            AddBox();
                            break;
                        case "bezier":
                            AddBezier();
                            break;
                        case "image":
                            AddImage();
                            break;
                        default:
                            ;
                    }
                });
            });


            let AddText = (): void => {
                let obj = {
                    rectangle: new ShapeEdit.Rectangle(200, 200, 100, 20),
                    property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, 'テキスト', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(98, 76, 54, 1), 1, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", ["noto"]), "left", "miter", {
                        "category": "",
                        "type": ""
                    })
                };
                let text = new ShapeEdit.Text(ShapeEdit.Canvas, obj);
                ShapeEdit.Canvas.Add(text);
            };

            let AddBox = (): void => {
                var obj = {
                    rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                    property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(98, 76, 54, 1), 1, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                        "category": "",
                        "type": ""
                    })
                };
                var box = new ShapeEdit.Box(ShapeEdit.Canvas, obj);
                ShapeEdit.Canvas.Add(box);
            };

            let AddBezier = (): void => {
                let obj = {
                    rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                    property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 1, new ShapeEdit.Font("", "", "", 18, "sans-serif", []), "", "miter", {
                        "category": "",
                        "type": ""
                    })
                };
                let context: ShapeEdit.Bezier = new ShapeEdit.Bezier(ShapeEdit.Canvas, obj);

                context.bezierCurveTo(310.17, 147.19, 310.17, 97.81, 271.5, 67.35);
                context.bezierCurveTo(232.84, 36.88, 170.16, 36.88, 131.5, 67.35);
                context.bezierCurveTo(92.83, 97.81, 92.83, 147.19, 131.5, 177.65);
                context.bezierCurveTo(170.16, 208.12, 232.84, 208.12, 271.5, 177.65);

                context.ResizeRectangle();

                ShapeEdit.Canvas.Add(context);
            };

            let AddImage = (): void => {
                var obj = {
                    rectangle: new ShapeEdit.Rectangle(200, 200, 200, 200),
                    property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '../../client/images/blank.png', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(98, 76, 54, 1), 1, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                        "category": "",
                        "type": ""
                    })
                };
                var image = new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj);
                ShapeEdit.Canvas.Add(image);
            };







            ipc.on('mode', (event: any, msg: any): void => {
                $scope.$evalAsync(($scope): void => {
                    ChangeEditMode(msg);
                });
            });

            let ChangeEditMode = (mode: string): void => {
                switch (mode) {
                    case 'move':
                        ShapeEdit.Canvas.SetMode(ShapeEdit.Mode.move);
                        break;
                    case 'draw':
                        ShapeEdit.Canvas.SetMode(ShapeEdit.Mode.draw);
                        break;
                    case 'bezier':
                        ShapeEdit.Canvas.SetMode(ShapeEdit.Mode.bezierdraw);
                        break;
                    default:
                        break;
                }
            };

            /*
             let EditClear: () => void = (): void => {
             _.each(ShapeEdit.Input, function (element: any, id: any): void {
             ShapeEdit.Wrapper.removeChild(element);
             delete ShapeEdit.Input[id];
             });
             };

             let Display: () => void = (): void => {
             $scope.fontfills = ShapeEdit.Canvas.CurrentFillColor().RGB();
             $scope.fontsize = ShapeEdit.Canvas.CurrentFontSize();
             $scope.FontKeyword = ShapeEdit.Canvas.CurrentFontKeyword();
             $scope.FontWeight = ShapeEdit.Canvas.CurrentFontWeight();
             $scope.FontVariant = ShapeEdit.Canvas.CurrentFontVariant();
             $scope.FontStyle = ShapeEdit.Canvas.CurrentFontStyle();
             $scope.Path = ShapeEdit.Canvas.CurrentPath();
             };

             let Select: (shape: any) => void = (shape: any): void => {
             let property: any = shape.Property();
             let fields: any = property.description["field"];
             $scope.fields = fields;
             $scope.fills = shape.FillColor().RGB();
             $scope.strokefills = shape.StrokeColor().RGB();
             $scope.fontsize = shape.FontSize();
             $scope.FontKeyword = shape.FontKeyword();
             $scope.FontWeight = shape.FontWeight();
             $scope.FontVariant = shape.FontVariant();
             $scope.FontStyle = shape.FontStyle();
             $scope.path = property.path;
             };

             let changeText = (): void => {
             if (ShapeEdit.Canvas) {
             ShapeEdit.Canvas.SetCurrentText($scope.text);
             }
             };

             let IsOpen = (): boolean => {
             return ShapeEdit.IsOpen;
             };

             let ToTop = () => {
             ShapeEdit.Canvas.ToTop();
             };

             let ToBottom = () => {
             ShapeEdit.Canvas.ToBottom();
             };

             let Lock = () => {
             ShapeEdit.Canvas.Lock();
             };

             let UnLockAll = () => {
             ShapeEdit.Canvas.UnLockAll();
             };

             let Group = () => {
             ShapeEdit.Canvas.Group();
             };

             let Ungroup = () => {
             ShapeEdit.Canvas.Ungroup();
             };

             let Copy = () => {
             ShapeEdit.Canvas.Copy();
             };

             let Paste = () => {
             ShapeEdit.Canvas.Paste();
             };

             let Create = (): void => {

             };

             let Open = () => {

             };

             let Update = (): void => {

             };

             let Delete = (): void => {
             };

             let PrintPDF = () => {
             };

             let PrintSVG = () => {
             };



             let strokewidthChange = (stroke: number): void => {
             var color: ShapeEdit.RGBAColor = null;
             if (stroke == 0) {
             color = new ShapeEdit.RGBAColor(0, 0, 0, 0);
             ShapeEdit.Canvas.SetCurrentStrokeColor(color);
             } else {
             ShapeEdit.Canvas.SetCurrentStrokeWidth(stroke);
             color = new ShapeEdit.RGBAColor(0, 0, 0, 1);
             color.SetRGB($scope.strokefills);
             ShapeEdit.Canvas.SetCurrentStrokeColor(color);
             }
             };

             let pathChange = (path: string): void => {
             ShapeEdit.Canvas.SetCurrentPath(path);
             };

             let changeFontStyle = (fontstyle: string): void => {
             if (ShapeEdit.Canvas) {
             ShapeEdit.Canvas.SetCurrentFontStyle(fontstyle);
             Display();
             }
             };

             // 太さ   normal、bold、lighter、bolder、または100〜900の9段階
             let changeFontWeigt = (fontweight: string): void => {
             if (ShapeEdit.Canvas) {
             ShapeEdit.Canvas.SetCurrentFontWeight(fontweight);
             Display();
             }
             };

             // font names
             let changeFontAlign = (FontAlign: string): void => {
             if (ShapeEdit.Canvas) {
             ShapeEdit.Canvas.SetCurrentAlign(FontAlign);
             Display();
             }
             };

             let fontsizeChange = (fontsize: number): void => {
             if (ShapeEdit.Canvas) {
             ShapeEdit.Canvas.SetCurrentFontSize(fontsize);
             Display();
             }
             };

             let labelChange = (label, index) => {
             if (label) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].label = label;
             }
             }
             };

             let modeChange = (mode, index) => {
             if (mode) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].mode = mode;
             }
             }
             };

             let typeChange = (type, index) => {
             if (type) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].type = type;
             }
             }
             };

             let requiredChange = (required, index) => {
             if (required) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].validate.required = (required == "true");
             }
             }
             };

             let maxlengthChange = (maxlength, index) => {
             if (maxlength) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].validate["ng-maxlength"] = Number(maxlength);
             }
             }
             };

             let minlengthChange = (minlength, index) => {
             if (minlength) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].validate["ng-minlength"] = Number(minlength);
             }
             }
             };

             let optionsChange = (options, index) => {
             if (options) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].options = options;
             }
             }
             };

             let onChangeChange = (onChange, index) => {
             if (onChange) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].events = {onChange: onChange};
             }
             }
             };

             let lookupChange = (lookup, index) => {
             if (lookup) {
             let shapes = ShapeEdit.Canvas.Selected();
             if (shapes.length != 0) {
             shapes[0].Property().description["field"][index].lookup = lookup;
             }
             }
             };





             let AddOval = (): void => {
             var obj = {
             rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
             property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(98, 76, 54, 1), 1, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
             "category": "",
             "type": ""
             })
             };
             var rect = new ShapeEdit.Oval(ShapeEdit.Canvas, obj);
             ShapeEdit.Canvas.Add(rect);
             };







             let DeleteSelected = (): void => {
             ShapeEdit.Canvas.DeleteSelected();
             };

             let SelectedCount = (): number => {
             return ShapeEdit.Canvas.SelectedCount();
             };

             ShapeEdit.onTick((shape: ShapeEdit.BaseShape, context: any): any => {
             return context;
             });

             ShapeEdit.onDraw((shape: ShapeEdit.BaseShape, context: any): void => {

             });

             ShapeEdit.onNew((shape: ShapeEdit.BaseShape): void => {
             switch (shape.type) {
             case "Text": {
             shape.Property().description["field"] = {
             text: {
             label: "text",  // shape.ID(),
             type: "text",
             mode: "static",
             validate: {required: true, "ng-maxlength": 50, "ng-minlength": 10},
             options: [],
             events: {onChange: ""},
             lookup: ""
             },
             color: {
             label: "color",
             type: "color",
             mode: "static",
             validate: {required: true, "ng-maxlength": 7, "ng-minlength": 7},
             options: [],
             events: {onChange: ""},
             lookup: ""
             }
             };
             }
             break;
             case "Box":
             case "Oval":
             case "Polygon" :
             case "Bezier" :
             case "Shapes": {
             shape.Property().description["field"] = {
             color: {
             label: "color",
             type: "color",
             mode: "static",
             validate: {required: true, "ng-maxlength": 7, "ng-minlength": 7},
             options: [],
             events: {onChange: ""},
             lookup: ""
             }
             };
             }
             break;
             case "ImageRect": {
             shape.Property().description["field"] = {
             text: {
             label: "text",  // shape.ID(),
             type: "text",
             mode: "static",
             validate: {required: true, "ng-maxlength": 50, "ng-minlength": 10},
             options: [],
             events: {onChange: ""},
             lookup: ""
             }
             };
             }
             }
             });



             ShapeEdit.onDelete((shape: ShapeEdit.BaseShape): void => {
             });

             ShapeEdit.onSelect((shape: ShapeEdit.BaseShape, context: any): void => {
             // for inPlace text input

             if (ShapeEdit.Canvas.SelectedCount() === 1) {
             if (shape.Parent().IsRoot()) {

             switch (shape.type) {
             case "Text" :                                               //for inPlace Input  only Text
             $scope.$evalAsync(   // $apply
             function ($scope) {
             let id: any = shape.ID();
             $scope.id = id;
             $scope.text = shape.Property().text;
             Select(shape);
             $scope.SelectType = "Text";
             }
             );
             break;
             case "Box":
             case "Oval":
             case "Polygon" :
             case "Bezier" :
             case "Shapes":
             case "ImageRect": {
             $scope.$evalAsync(   // $apply
             function ($scope) {
             let id: any = shape.ID();
             $scope.id = id;
             Select(shape);
             $scope.SelectType = "Image";
             }
             );
             }
             break;

             default:
             }
             }
             } else {
             EditClear();     // for inPlace text input
             }
             });

             ShapeEdit.onDeselect((shape: ShapeEdit.BaseShape, context: any): void => {
             switch (shape.type) {
             case "Text" :
             case "Box":
             case "Oval":
             case "Polygon" :
             case "Bezier" :
             case "ImageRect":
             $scope.SelectImage = false;
             break;
             default:
             }
             });

             ShapeEdit.onMove((shape: ShapeEdit.BaseShape): void => {
             });

             ShapeEdit.onResize((shape: ShapeEdit.BaseShape): void => {
             });

             ShapeEdit.onDeformation((shape: ShapeEdit.BaseShape): void => {
             });

             ShapeEdit.onChange((): void => {

             });

             ShapeEdit.onKeydown((shape: ShapeEdit.BaseShape, e: any): void => {

             });

             ShapeEdit.onDrop((shape: ShapeEdit.BaseShape, e: any): void => {
             if (e.dataTransfer.files.length == 0) {
             var url = e.dataTransfer.getData('url');
             if (url != "") {
             var image = new Image();
             image.crossOrigin = 'Anonymous';
             // for url load error detect.
             //image.setAttribute('crossOrigin', 'anonymous');
             image.onload = (ex: any): void => {                            // URLがイメージとしてロード可能
             var w = ex.target.width;
             var h = ex.target.height;
             let obj = {
             rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
             property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
             "category": "",
             "type": "meter"
             })
             };

             ShapeEdit.Canvas.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
             };
             image.onerror = (): void => {                           // URLがイメージとしてロード不可能
             };
             image.src = url;
             }
             } else {
             let file: any = e.dataTransfer.files[0];
             let reader: any = new FileReader();
             reader.onload = ((theFile) => {

             return (ex) => {
             let img = new Image();
             img.onload = (): void => {
             let w = img.width;
             let h = img.height;
             let url = ex.target.result;
             let obj = {
             rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
             property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
             "category": "",
             "type": "meter"
             })
             };
             ShapeEdit.Canvas.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
             };
             img.src = ex.target.result;
             };
             })(file);
             reader.readAsDataURL(file);
             }
             });

             $scope.opened = false;
             $scope.IsOpen = IsOpen;
             $scope.editmode = "move";

             $scope.changeText = changeText;
             $scope.ToTop = ToTop;
             $scope.ToBottom = ToBottom;
             $scope.Lock = Lock;
             $scope.UnLockAll = UnLockAll;
             $scope.Group = Group;
             $scope.Ungroup = Ungroup;
             $scope.Copy = Copy;
             $scope.Paste = Paste;
             $scope.Create = Create;
             $scope.Open = Open;
             $scope.Update = Update;
             $scope.Delete = Delete;
             $scope.PrintPDF = PrintPDF;
             $scope.PrintSVG = PrintSVG;
             $scope.ChangeEditMode = ChangeEditMode;
             $scope.strokewidthChange = strokewidthChange;
             $scope.pathChange = pathChange;
             $scope.changeFontStyle = changeFontStyle;
             $scope.changeFontWeigt = changeFontWeigt;
             $scope.changeFontAlign = changeFontAlign;
             $scope.fontsizeChange = fontsizeChange;
             $scope.labelChange = labelChange;
             $scope.modeChange = modeChange;
             $scope.typeChange = typeChange;
             $scope.requiredChange = requiredChange;
             $scope.maxlengthChange = maxlengthChange;
             $scope.minlengthChange = minlengthChange;
             $scope.optionsChange = optionsChange;
             $scope.onChangeChange = onChangeChange;
             $scope.lookupChange = lookupChange;
             $scope.AddText = AddText;
             $scope.AddBox = AddBox;
             $scope.AddOval = AddOval;
             $scope.AddBezier = AddBezier;
             $scope.AddImage = AddImage;
             $scope.hoge1 = hoge1;
             $scope.DeleteSelected = DeleteSelected;
             $scope.SelectedCount = SelectedCount;

             $scope.$watch('fills', (color_string: string): void => {
             if (color_string) {
             let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
             color.SetRGB(color_string);
             ShapeEdit.Canvas.SetCurrentFillColor(color);
             Display();
             }
             });

             $scope.$watch('strokefills', (color_string: string): void => {
             if (color_string) {
             let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
             color.SetRGB(color_string);
             ShapeEdit.Canvas.SetCurrentStrokeColor(color);
             Display();
             }
             });

             $scope.$watch('FontVariant', (FontVariant): void => {
             if (FontVariant) {
             ShapeEdit.Canvas.SetCurrentFontVariant(FontVariant);
             Display();
             }
             });

             $scope.$watch('FontWeight', (fontweight: string): void => {
             if (fontweight) {
             ShapeEdit.Canvas.SetCurrentFontWeight(fontweight);
             Display();
             }
             });

             $scope.$watch('FontKeyword', (FontKeyword: string): void => {
             if (FontKeyword) {
             ShapeEdit.Canvas.SetCurrentFontKeyword(FontKeyword);
             Display();
             }
             });

             $scope.$watch('FontFamily', (FontFamily: string): void => {
             if (FontFamily) {
             ShapeEdit.Canvas.SetCurrentFontFamily([FontFamily]);
             Display();
             }
             });

             Display();
             */
        }]);

    Controllers.filter('keyboardShortcut', ($window): any => {
        return (str): void => {
            if (str) {
                let keys = str.split('-');
                let isOSX = /Mac OS X/.test($window.navigator.userAgent);

                let seperator = (!isOSX || keys.length > 2) ? '+' : '';

                let abbreviations = {
                    M: isOSX ? '' : 'Ctrl',
                    A: isOSX ? 'Option' : 'Alt',
                    S: 'Shift'
                };

                return keys.map((key, index) => {
                    let last = index == keys.length - 1;
                    return last ? key : abbreviations[key];
                }).join(seperator);
            }
        };

    });
}