/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../typings/index.d.ts" />

"use strict";

const electron = require('electron');
const {dialog} = require('electron');
const browserWindow = electron.BrowserWindow;

let File = require('./common/utility.js').File;

let ShapeEditModule: any = require("./common/shape_edit/shape_edit");
let ServerModule: any = require("./common/shape_edit/server_canvas");
let AdaptorModule: any = require("./common/shape_edit/adaptor");

export namespace FormatterModule {

    export class Formatter {

        private file: any;
        public current_file: string;

        constructor() {
            this.file = new File();
            this.current_file = '.';
        }

        private svg(tmp_path: string, layout: any): void {
            let tmp_file = '/noname.svg';
            if (layout) {
                let handlers: ShapeEdit.EventHandlers = new ShapeEditModule.EventHandlers();
                let plugins: ShapeEdit.Plugins = new ShapeEditModule.Plugins();
                let document: any = JSON.parse(layout.content.text);
                let servercanvas = new ServerModule.StubCanvas(document.width, document.height);

                let adaptor = new AdaptorModule.SVGAdaptor();
                let canvas: ShapeEdit.Canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                ShapeEditModule.Canvas.Load(canvas, document, handlers);

                fs.writeFile(tmp_path + tmp_file, canvas.ToSVG(), (error) => {
                    //ok
                });


            }
        }

        private pdf(tmp_path: string, layout: any, format: any): void {
            let tmp_file = '/noname.pdf';
            if (layout) {
                let handlers: ShapeEdit.EventHandlers = new ShapeEditModule.EventHandlers();
                let plugins: ShapeEdit.Plugins = new ShapeEditModule.Plugins();
                let document: any = JSON.parse(layout.content.text);
                let servercanvas = new ServerModule.StubCanvas(document.width, document.height);

                let adaptor = new AdaptorModule.PDFAdaptor(tmp_path, format);
                let canvas: ShapeEdit.Canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                ShapeEditModule.Canvas.Load(canvas, document, handlers);

                canvas.ToPDF((error: any): void => {

                    if (!error) {

                        let writer = fs.createWriteStream(tmp_path + tmp_file);
                        doc.pipe(writer);
                        doc.end();
                        writer.on('finish', (): void => {
                            //ok;
                        });

                    }

                });

                let doc = adaptor.Write();

            }
        }

    }
}

module.exports = FormatterModule;