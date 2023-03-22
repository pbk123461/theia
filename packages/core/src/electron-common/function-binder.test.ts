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

import { assert } from 'chai';
import { Container } from 'inversify';
import { FunctionBinder } from './function-binder';

describe('FunctionBinder', () => {

    let container: Container;
    let binder: FunctionBinder;

    beforeEach(() => {
        container = new Container();
        container.bind(FunctionBinder).toSelf().inSingletonScope();
        binder = container.get(FunctionBinder);
    });

    it('no thisArg should return the function as-is', () => {
        function a(): string {
            return 'a';
        }
        const b = () => 'b';
        assert.strictEqual(a, binder.bindfn(a));
        assert.strictEqual(b, binder.bindfn(b));
    });

    describe('bound fn identity should be conserved', () => {

        class A {
            protected a = 'a';
            protected b = 'b';
            methodA(): string {
                return this.a;
            }
            methodB(): string {
                return this.b;
            }
        }

        const a1 = new A();
        const a2 = new A();

        it('bound methods should work', () => {
            const boundfn = binder.bindfn(a1.methodA, a1);
            assert.strictEqual(boundfn(), 'a');
        });

        it('identity is preserved when the same arguments are used', () => {
            assert.strictEqual(binder.bindfn(a1.methodA, a1), binder.bindfn(a1.methodA, a1));
        });

        it('identity is different when func is different', () => {
            assert.notStrictEqual(binder.bindfn(a1.methodA, a1), binder.bindfn(a1.methodB, a1));
        });

        it('identity is different when thisArg is different', () => {
            assert.notStrictEqual(binder.bindfn(a1.methodA, a1), binder.bindfn(a1.methodA, a2));
        });
    });
});
