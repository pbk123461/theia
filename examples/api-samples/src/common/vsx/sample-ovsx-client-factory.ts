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

import { RequestService } from '@theia/core/shared/@theia/request';
import { interfaces } from '@theia/core/shared/inversify';
import { OVSXHttpClient } from '@theia/ovsx-client';
import { OVSXClientFactory } from '@theia/vsx-registry/lib/common/ovsx-client-provider';
import { SampleAppInfo } from './sample-app-info';

export function rebindOVSXClientFactory(rebind: interfaces.Rebind): void {
    // rebind the OVSX client factory so that we can replace patterns like "${self}" in the configs:
    rebind(OVSXClientFactory)
        .toDynamicValue(ctx => {
            const requestService = ctx.container.get<RequestService>(RequestService);
            const clientFactory = OVSXHttpClient.createClientFactory(requestService);
            const appInfo = ctx.container.get(SampleAppInfo);
            const selfOrigin = appInfo.getSelfOrigin();
            return url => clientFactory(url.replace('${self}', selfOrigin));
        })
        .inSingletonScope();
}
