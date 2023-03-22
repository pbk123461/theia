// *****************************************************************************
// Copyright (C) 2023 Ericsson and others.
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

import { injectable } from 'inversify';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...params: any[]) => any;

/**
 * Utility to bind functions and preserve indentity.
 *
 * @example
 *
 * class Foo {
 *     protected buzz = 2;
 *     bar() {
 *         return this.buzz;
 *     }
 * }
 * const instance = new Foo();
 * // Identity is lost even when binding twice to the same reference:
 * instance.bar.bind(instance) !== instance.bar.bind(instance);
 * // Identity is conversed when using FunctionBinder:
 * functionBinder.bindfn(instance.bar, instance) === functionBinder.bindfn(instance.bar, instance);
 */
@injectable()
export class FunctionBinder {

    /** callbackfn => thisArg => boundfn */
    protected boundfnCache = new WeakMap<AnyFunction, WeakMap<object, AnyFunction>>();

    bindfn<T extends AnyFunction>(listener: T, thisArg?: object): T {
        if (!thisArg) {
            return listener;
        }
        // We need to preserve the callback's identity based on the
        // (callbackfn, thisArg) pair.
        let boundfns = this.boundfnCache.get(listener);
        if (!boundfns) {
            this.boundfnCache.set(listener, boundfns = new WeakMap());
        }
        let boundfn = boundfns.get(thisArg);
        if (!boundfn) {
            boundfns.set(thisArg, boundfn = listener.bind(thisArg));
        }
        return boundfn as T;
    }
}
