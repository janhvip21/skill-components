// Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

import { HandlerInput } from 'ask-sdk-core';
import { Response } from "ask-sdk-model";

import { apiNamespace } from '../config';
import { ListNav } from '../interface';
import { PagingDirection } from '../list-provider';
import { ListNavSessionState } from '../session-state';
import { BaseApiHandler } from './base-api-handler';

// handler for API called when the previous page is requested by the user before the
// getPage API is called; sets some session state if ListNav.useSessionArgs is true
export class RecordPrevEventHandler extends BaseApiHandler {
    static defaultApiName = `${apiNamespace}.pagination.recordPrevEvent`;

    constructor(
        apiName: string = RecordPrevEventHandler.defaultApiName
    ) {
        super(apiName);
    }

    handle(handlerInput : HandlerInput): Response {

        if (ListNav.useSessionArgs) {
            const sessionState = ListNavSessionState.load(handlerInput);
            const currentPageTokens = sessionState.argsState?.currentPageTokens;

            if (currentPageTokens == undefined) {
                // shouldn't be possible, as initial getPage API call should have set the
                // current page tokens
                throw new Error("No current page info in list nav session state");
            }

            sessionState.argsState!.upcomingPageToken = currentPageTokens.prevPageToken;
            sessionState.argsState!.pagingDirection = PagingDirection.PREVIOUS;
            sessionState.save(handlerInput);
        }

        return handlerInput.responseBuilder
            .withApiResponse({})
            .withShouldEndSession(false)
            .getResponse();
    }
}
