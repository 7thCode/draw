/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../../typings/index.d.ts" />

"use strict";

let Application: any = angular.module('Application',['ngMaterial','Controllers','Providers']);

Application.config(['ShapeEditProvider', function (ShapeEditProvider:any):void {
    ShapeEditProvider.configure({
        wrapper: 'wrapper',
        canvas: 'canvas',
        width: 600,
        height: 600
    });
}]);