/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../../../../typings/index.d.ts" />
/// <reference path="./shape_edit.ts" />

"use strict";

const server = (typeof window === 'undefined');

namespace Adaptor {

    if (server) {
        var _: _.LoDashStatic = require('lodash');
        var ShapeEdit: any = require("./shape_edit");
        var PDFDocument = require('pdfkit');
        var http = require('http');
        var request = require('request');
        var url = require('url');
        var fs = require('fs');
        var Q = require('q');
        var crypto = require('crypto');
    }

    export class SVGAdaptor {

        private tilesizew = 64;
        private tilesizeh = 64;

        public Bezier(data: any): string {
            let bezier: string = '<path id="' + data.ID() + '" stroke="' + data.property.strokestyle.ToString() + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="' + data.property.fillstyle.ToString() + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.CurveShape.Each(data.vertex.list, (vertex) => {
                bezier += " M " + vertex.x + "," + vertex.y;
                startpoint = vertex;
            }, (vertex) => {
                bezier += " C " + vertex.controlPoint0.x + "," + vertex.controlPoint0.y + " " + vertex.controlPoint1.x + "," + vertex.controlPoint1.y + " " + vertex.x + "," + vertex.y;
            }, (vertex) => {
                bezier += " C " + vertex.controlPoint0.x + "," + vertex.controlPoint0.y + " " + vertex.controlPoint1.x + "," + vertex.controlPoint1.y + " " + vertex.x + "," + vertex.y;
                bezier += " C " + startpoint.controlPoint0.x + "," + startpoint.controlPoint0.y + " " + startpoint.controlPoint1.x + "," + startpoint.controlPoint1.y + " " + startpoint.x + "," + startpoint.y;
            });
            bezier += '" />';

            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            let defs = '<defs>' +
                '<pattern id="' + data.ID() + '_IMAGE" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" patternUnits="userSpaceOnUse">' +
                '<image x="0" y="0" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" xlink:href="' + path + '"/>' +
                '</pattern>' +
                '</defs>';

            return bezier + defs;
        }

        public Polygon(data: any): string {

            let lineshape: string = '<path id="' + data.ID() + '" stroke="' + data.property.strokestyle.ToString() + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="' + data.property.fillstyle.ToString() + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            if (data.property.path != "") {
                lineshape = '<path id="' + data.ID() + '" stroke="' + data.property.strokestyle.ToString() + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="url(#' + data.ID() + '_IMAGE)' + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            }

            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.LineShape.Each(data.vertex.list, (vertex) => {
                    lineshape += "M " + vertex.x + "," + vertex.y + " L ";
                    startpoint = vertex;
                },
                (vertex) => {
                    lineshape += vertex.x + "," + vertex.y + " ";
                },
                (vertex) => {
                    lineshape += vertex.x + "," + vertex.y + " ";
                    lineshape += startpoint.x + "," + startpoint.y + " ";
                }
            );
            lineshape += "Z M " + startpoint.x + "," + startpoint.y + '" />';


            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            let defs = '<defs>' +
                '<pattern id="' + data.ID() + '_IMAGE" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" patternUnits="userSpaceOnUse">' +
                '<image x="0" y="0" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" xlink:href="' + path + '"/>' +
                '</pattern>' +
                '</defs>';

            return lineshape + defs;
        }

        public Text(data: any): string {
            let text: string = '';
            let defs: string = '';

            if (data) {
                if (data.property) {
                    if (data.property.font) {
                        if (data.property.font.keyword) {
                            let urlkeyword = data.property.font.keyword.split(' ').join('+');

                            text = '<text text-rendering="geometricPrecision" id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-family="' + data.property.font.keyword + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';
                            //  text = '<text id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-family="' + 'NotoSansBlack' + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';
                            data.DrawText(1, (line, x, y) => {
                                text += '<tspan x="' + x + '" y="' + y + '">' + line + '</tspan>';
                            });
                            text += '</text>';

                            defs = "<defs>" +
                                '<style type="text/css">' +
                                // '@import url(file:///Users/oda/project/webstorm/pdf_writer/public/fonts/woff/NotoSansBlack.woff);' +
                                '@import url(http://fonts.googleapis.com/css?family=' + urlkeyword + ');' +
                                '</style>' +
                                "</defs>";
                        }
                        else {
                            let a = 1;
                        }
                    } else {
                        let b = 1;
                    }
                } else {
                    let c = 1;
                }
            }
            else {
                let d = 1;
            }

            return text + defs;
        }

        public Box(data: any): string {
            let box = '<rect id="' + data.ID() + '" stroke="' + data.property.strokestyle.ToString() + '" stroke-width="' + data.property.strokewidth + '" fill="' + data.property.fillstyle.ToString() + '" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />';

            let defs = '<defs>' +
                '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '</filter>' +
                '</defs>';

            return box + defs;
        }

        public Oval(data: any): string {
            let rx = data.rectangle.size.w / 2;
            let ry = data.rectangle.size.h / 2;
            let cx = data.rectangle.location.x + rx;
            let cy = data.rectangle.location.y + ry;
            let ellipse = '<ellipse id="' + data.ID() + '" stroke="' + data.property.strokestyle.ToString() + '" stroke-width="' + data.property.strokewidth + '" fill="' + data.property.fillstyle.ToString() + '" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" />';

            let defs = '<defs>' +
                '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '</filter>' +
                '</defs>';
            return ellipse + defs;
        }

        public ImageRect(data: any): string {
            let rect = '<rect id="' + data.ID() + '" stroke="none" fill="url(#' + data.ID() + ')" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />';

            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            let defs = '<defs>' +
                '<pattern id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '<image xlink:href="' + path + '" preserveAspectRatio="none" x="0" y="0" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />' +
                '</pattern>' +
                '</defs>';
            return rect + defs;
        }

        public Shapes(data: any): string {
            let result: string = '<g id="' + data.ID() + '">';
            _.each<ShapeEdit.BaseShape>(data.Shapes(), (shape: ShapeEdit.BaseShape) => {
                result += shape.ToSVG();
            });
            result += "</g>";

            let defs = '<defs>' +
                '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '</filter>' +
                '</defs>';
            return result + defs;
        }

        public Canvas(canvas: any): string {
            let result: string = '<?xml version="1.0" encoding="UTF-8"?>' +
                '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                //     '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + canvas.canvas.width + '" height="' + canvas.canvas.height + '"  xml:space="preserve">' +
                '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + canvas.canvas.width + ' ' + canvas.canvas.height + '"  xml:space="preserve">' +
                canvas.shapes.ToSVG() +
                '</svg>';
            return result;
        }

    }

    export class PDFAdaptor {

        private path: string;
        private doc = null;
        private serif = "";
        private sans_serif = "";
        private pagehight = 0;
        private originx = 40;
        private originy = 40;
        private nameboxwidth = 250;
        private valueboxwidth = 250;
        private boxhight = 20;
        private stringoffsetx = 3;
        private stringoffsety = 2;

        private tilesizew = 64;
        private tilesizeh = 64;

        constructor(work_path: string, paper: any) {
            this.path = work_path;

            this.serif = "public/fonts/ttf/ipaexm.ttf";
            this.sans_serif = "public/fonts/ttf/ipaexg.ttf";

            this.doc = new PDFDocument(paper);
            this.doc.registerFont('serif', this.serif, '');
            this.doc.registerFont('sans-serif', this.sans_serif, '');
            this.pagehight = 660;
            this.originx = 40;
            this.originy = 40;
            this.boxhight = 20;
            this.stringoffsetx = 3;
            this.stringoffsety = 2;
        }

        public Bezier(data: any, callback: (error: any) => void): void {
            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.CurveShape.Each(data.vertex.list, (vertex) => {
                this.doc.moveTo(vertex.x, vertex.y);
                startpoint = vertex;
            }, (vertex) => {
                this.doc.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
            }, (vertex) => {
                this.doc.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
            });

            this.doc.bezierCurveTo(startpoint.controlPoint0.x, startpoint.controlPoint0.y, startpoint.controlPoint1.x, startpoint.controlPoint1.y, startpoint.x, startpoint.y);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), data.property.strokestyle.RGB());
            callback(null);
        }

        public Polygon(data: any, callback: (error: any) => void): void {
            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.LineShape.Each(data.vertex.list, (vertex) => {
                    this.doc.moveTo(vertex.x, vertex.y);
                    startpoint = vertex;
                },
                (vertex) => {
                    this.doc.lineTo(vertex.x, vertex.y);
                },
                (vertex) => {
                    this.doc.lineTo(vertex.x, vertex.y);
                }
            );

            this.doc.lineTo(startpoint.x, startpoint.y);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), data.property.strokestyle.RGB());
            callback(null);
        }

        public Text(data: any, callback: (error: any) => void): void {
            let text: string = '';
            let defs: string = '';

            if (data) {
                if (data.property) {
                    if (data.property.font) {
                        if (data.property.font.keyword) {
                            let urlkeyword = data.property.font.keyword.split(' ').join('+');
                            let lineheight = data.property.font.size * 1.2;

                            this.doc.fillAndStroke(data.property.fillstyle.RGB(), data.property.strokestyle.RGB());
                            data.DrawText(1, (line, x, y) => {
                                this.doc.font(data.property.font.keyword).fontSize(data.property.font.size).text(line, x, y - lineheight);
                                callback(null);
                            });
                        } else {
                            callback({code: 100, message: "no keyword"});
                        }
                    } else {
                        callback({code: 200, message: "no font"});
                    }
                } else {
                    callback({code: 300, message: "no property"});
                }
            } else {
                callback({code: 400, message: "no data"});
            }
        }

        public Box(data: any, callback: (error: any) => void): void {
            this.doc.rect(data.rectangle.location.x, data.rectangle.location.y, data.rectangle.size.w, data.rectangle.size.h);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), data.property.strokestyle.RGB());
            callback(null);
        }

        public Oval(data: any, callback: (error: any) => void): void {
            let rx = data.rectangle.size.w / 2;
            let ry = data.rectangle.size.h / 2;
            let cx = data.rectangle.location.x + rx;
            let cy = data.rectangle.location.y + ry;

            this.doc.ellipse(cx, cy, rx, ry);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), data.property.strokestyle.RGB());
            callback(null);
        }

        public ImageRect(data: any, callback: (error: any) => void): void {

            let _doc = this.doc;

            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            let _url = url.parse(path);
            let protocol = _url.protocol;
            let temp_path = this.path;
            if (protocol == "data:") { // inplace

                let md5hash = crypto.createHash('md5');
                md5hash.update(path, 'binary');
                let file_name = md5hash.digest('hex');  // generate unique filename.

                let regex = /^data:.+\/(.+);base64,(.*)$/;
                let matches = path.match(regex);
                let ext = matches[1];
                if (ext == "jpg" || ext == "jpeg" || ext == "png") { // for pdfkit

                    // dataToImage
                    let content = matches[2];
                    let buffer = new Buffer(content, 'base64');
                    let target_file_path = temp_path + "/" + file_name;
                    fs.writeFile(target_file_path, buffer, 'binary', (error: any): void => {
                        if (!error) {
                            try {
                                _doc.image(target_file_path, data.rectangle.location.x, data.rectangle.location.y, {width: data.rectangle.size.w, height: data.rectangle.size.h});
                                fs.unlink(target_file_path, (error: any): void => {
                                    if (!error) {
                                        callback(null);
                                    } else {
                                        callback(error);
                                    }
                                });
                            } catch (e) {
                                callback(e);
                            }
                        } else {
                            callback(error);
                        }
                    })

                } else {
                    callback({code: 0, message: "image format not support for PDF :" + ext});
                }

            } else { // remote file
                let split_path = _url.pathname.split("/");
                let file_name = split_path[split_path.length - 1];
                let split_filename = file_name.split(/\.(?=[^.]+$)/);
                let ext = split_filename[split_filename.length - 1];

                if (ext == "jpg" || ext == "jpeg" || ext == "png") { // for pdfkit
                    let buffer = [];
                    request.get(path, {timeout: 1500}, (error: any): void => { //Only for timeout check
                        if (!error) {
                            let innner_req = http.get(path, (res: any): void => {
                                res.setEncoding('binary');
                                res.on('data', (chunk: any): void => {
                                    buffer += chunk;
                                });

                                res.on('end', () => {
                                    let target_file_path = temp_path + "/" + file_name;
                                    fs.writeFile(target_file_path, buffer, 'binary', (error: any): void => {
                                        if (!error) {
                                            try {
                                                _doc.image(target_file_path, data.rectangle.location.x, data.rectangle.location.y, {width: data.rectangle.size.w, height: data.rectangle.size.h});
                                                callback(null);
                                            } catch (e) {
                                                callback(e);
                                            }
                                        } else {
                                            callback(error);
                                        }
                                    })
                                })
                            });

                            innner_req.on('error', (e: any): void => {
                                callback(e);
                            })
                        } else {
                            callback({code: 0, message: error.message});  //Because timeout occurs temporarily, it is not an error.
                        }
                    });
                } else {
                    callback({code: 0, message: "image format not support for PDF :" + ext});
                }
            }
        }

        public Shapes(data: any, callback: (error: any) => void): void {

            let draw = (shape: any): any => {
                return (): any => {
                    return new Promise((resolve: any, reject: any): void => {

                        shape.ToPDF((error): void => {
                            if (!error) {
                                resolve(null);
                            } else {
                                if (error.code == 0) {
                                    resolve(null);
                                } else {
                                    reject(error);
                                }
                            }
                        });

                    });
                };
            };

            let promises = [];

            _.forEach(data.Shapes(), (shape) => {
                promises.push(draw(shape));
            });

            promises.reduce((prev, current, index, array): any => {
                return prev.then(current);
            }, Promise.resolve()).then(() => {
                callback(null);
            }).catch((error) => {
                callback(error);
            });

        }

        public Canvas(canvas: any, callback: (error: any) => void): void {
            canvas.shapes.ToPDF(callback);
        }

        public Write(): any {
            this.doc.stroke();
            return this.doc;
        }
    }

}

if (server) {
    module.exports = Adaptor;
}
