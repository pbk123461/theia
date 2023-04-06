// *****************************************************************************
// Copyright (C) 2023 TypeFox and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import * as path from 'path';
import * as fs from 'fs';

import type { Compiler } from 'webpack';

const RIPGREP_REGEX = /^@vscode\/ripgrep$/;
// const ripgrepBinFolder = path.resolve(path.dirname(require.resolve('vscode-ripgrep/package.json')), 'bin');

export class NativeWebpackPlugin {

    private bindings = new Map<string, string>();

    constructor(targetFolder: string, nativeBindings?: [string, string][]) {
        cleanTmp();
        for (const binding of nativeBindings ?? []) {
            this.nativeBinding(binding[0], binding[1]);
        }
    }

    nativeBinding(dependency: string, nodePath: string): void {
        this.bindings.set(dependency, nodePath);
    }

    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void {
        const ripgrepReplacement = buildFile('ripgrep.js', ripgrep);
        compiler.hooks.normalModuleFactory.tap(
            'NativeWebpackPlugin',
            nmf => {
                nmf.hooks.beforeResolve.tap('NativeWebpackPlugin', result => {
                    if (RIPGREP_REGEX.test(result.request)) {
                        result.request = ripgrepReplacement;
                    }
                });
                nmf.hooks.afterResolve.tap('NativeWebpackPlugin', result => {
                    const createData = result.createData;
                    if (createData.resource && RIPGREP_REGEX.test(createData.resource)) {
                        createData.resource = ripgrepReplacement;
                    }
                    // if (resourceRegExp.test(createData.resource)) {
                    //     if (typeof newResource === 'function') {
                    //         newResource(result);
                    //     } else {
                    //         const inputFS = compiler.inputFileSystem;
                    //         if (
                    //             newResource.startsWith('/') ||
                    //             (newResource.length > 1 && newResource[1] === ':')
                    //         ) {
                    //             createData.resource = newResource;
                    //         } else {
                    //             createData.resource = inputFS.join!(
                    //                 inputFS,
                    //                 inputFS.dirname!(createData.resource!),
                    //                 newResource
                    //             );
                    //         }
                    //     }
                    // }
                });
            }
        );
    }
}

function cleanTmp(): void {
    const tmp = tmpDir();
    if (fs.existsSync(tmp)) {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}

function buildFile(name: string, content: string): string {
    const tmpFile = tmpDir(name);
    fs.mkdirSync(path.dirname(tmpFile));
    fs.writeFileSync(tmpFile, content);
    return tmpFile;
}

const ripgrep = `
const path = require('path');

exports.rgPath = path.join(__dirname, \`./rg\${process.platform === 'win32' ? '.exe' : ''}\`);
`;

function tmpDir(...segments: string[]): string {
    return path.resolve(__dirname, '..', 'tmp', ...segments);
}
