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

export namespace MainModule {

    export class Main {

        private file: any;
        public current_file: string;

        constructor() {
            this.file = new File();
            this.current_file = '.';
        }

        public new(value:string): boolean {
            let result: boolean = false;
            let options = {
                title: '保存',
                defaultPath: this.current_file,
                filters: [
                    {name: 'text file', extensions: ['txt']},
                    {name: 'js file', extensions: ['js']}
                ]
            };
            let filename = dialog.showSaveDialog(browserWindow, options);
            if (filename) {
                this.current_file = filename;
                result = this.file.writefileSync(filename, value);
            }
            return result;
        }

        public open(callback:(error, data) => void): void {
            let result:string = "";
            let options = {
                title: 'タイトル',
                properties: ['openFile'],
                filters: [
                    {name: 'text file', extensions: ['txt']},
                    {name: 'JS file', extensions: ['js']},
                    {name: 'HTML file', extensions: ['html']}
                ]
            };
            let filenames = dialog.showOpenDialog(browserWindow, options);
            if (filenames) {
                if (filenames.length > 0) {
                    result = this.open_as(filenames[0]);
                    callback(null,result);
                }
            }
        }

        public open_as(filename: string): string {
            this.current_file = filename;
            return this.file.readfileSync(this.current_file);
        }

        public close(callback:(error, data) => void): void {
            this.current_file = '.';
            callback(null,"");
        }

        public save(data: string): boolean {
            if (this.current_file) {
                return this.file.writefileSync(this.current_file, data);
            }
        }

        public save_as(data: string): boolean {
            let result: boolean = false;
            let options = {
                title: '保存',
                defaultPath: this.current_file,
                filters: [
                    {name: 'text file', extensions: ['txt']},
                    {name: 'js file', extensions: ['js']}
                ]
            };
            let filename = dialog.showSaveDialog(browserWindow, options);
            if (filename) {
                result = this.file.writefileSync(filename, data);
            }
            return result;
        }
    }
}

module.exports = MainModule;