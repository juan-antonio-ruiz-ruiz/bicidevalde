(function (global) {
    function b64DecodeUnicode(str) {
        // Convert base64 to a string
        const binaryString = atob(str);

        // Convert binary string to a byte array
        const byteArray = new Uint8Array(binaryString.length);
        for (var i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        // Convert byte array to a string
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(byteArray);
    }

    global.insiteScripts = global.insiteScripts || {};
    global.insiteScripts.message =
        global.insiteScripts.message ||
        function message(scriptOptions) {
            window?.waitForDeferred?.('dmAjax', () => {
                const dmSmartScriptSettings = scriptOptions.settings,
                    dmSmartScriptRuleId = scriptOptions.ruleId,
                    dmSmartScriptDontParseSettings =
                        scriptOptions.dontParseSettings;

                // don't show a notification if another notification is currently displaying
                const currentNotification = document.querySelector(
                    '#d-notification-bar'
                );
                if (
                    currentNotification &&
                    !currentNotification.getAttribute('data-was-shown')
                ) {
                    return;
                }
                const settings = dmSmartScriptDontParseSettings
                    ? dmSmartScriptSettings
                    : JSON.parse(b64DecodeUnicode(dmSmartScriptSettings));
                const messageBody = decodeURIComponent(settings.body);
                const messageBackground = settings.background
                    ? decodeURIComponent(settings.background)
                    : undefined;
                // Optional appearance value written by the React personalization
                // wizard. Older rules omit it and the runtime then sets no
                // custom property, so the bar keeps its stylesheet default.
                const messagePaddingBlock = settings.paddingBlock;

                const canShowNotification = function (
                    dmSmartScriptRuleId,
                    settings
                ) {
                    if (shouldCheckMultipleConditions) {
                        const { conditionsToCheck } =
                            shouldShowActionRule(settings);

                        if (!conditionsToCheck) {
                            return true; //meaning conditions are filtered in BE
                        } else {
                            return conditionsToCheck.every(
                                ({ condition, callback }) => {
                                    return (
                                        callback &&
                                        callback(
                                            dmSmartScriptRuleId,
                                            condition,
                                            ActionType.MESSAGE
                                        )
                                    );
                                }
                            );
                        }
                    } else {
                        const {
                            shouldCheckUserVisitsCondition,
                            shouldCheckDateTimeRangeCondition,
                        } = shouldShowActionRule(settings);

                        if (shouldCheckUserVisitsCondition) {
                            return shouldShowRuleObjectForUserVisit(
                                dmSmartScriptRuleId,
                                settings,
                                ActionType.MESSAGE
                            );
                        }
                        if (shouldCheckDateTimeRangeCondition) {
                            return shouldShowRuleObjectForDateTimeRange(
                                dmSmartScriptRuleId,
                                settings,
                                ActionType.MESSAGE
                            );
                        }
                        return true;
                    }
                };

                const shouldShowMessage =
                    canShowNotification(dmSmartScriptRuleId, settings) &&
                    scriptOptions.useNew &&
                    'runtime' in window;

                if (shouldShowMessage) {
                    setSmartRuleCookie(dmSmartScriptRuleId, ActionType.MESSAGE);
                    setTimeout(() => {
                        $(global.document).ready(function () {
                            const layoutContainer =
                                document.querySelector('[dmtemplateid]');

                            return global.runtime.notify({
                                markup: messageBody,
                                delay: Math.max(settings.delay || 1, 1.5),
                                messageContainer: layoutContainer,
                                background: messageBackground,
                                paddingBlock: messagePaddingBlock,
                                duration: scriptOptions.duration || -1,
                                shouldMoveContainer:
                                    !!window.flexSite ||
                                    !/amburger/i.test(
                                        layoutContainer.getAttribute(
                                            'dmtemplateid'
                                        )
                                    )
                            });
                        });
                    }, 0);
                    return;
                }
                // scriptOptions.useNew was false or window.runtime wasn't
                // present. A legacy jQuery fallback bar used to live here,
                // built from a messageDiv/closeTrigger and only ever shown
                // by triggerMessage — which itself started with
                // `if (!shouldShowMessage) return;`, so with shouldShowMessage
                // false that fallback could never display anything. Removed
                // as dead code (see git history); there is nothing left to do.
            });
        };
})(this);
