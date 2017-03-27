﻿var senparc = {};
var maxSubMenuCount = 5;
var menuState;
senparc.menu = {
    token: '',
    init: function () {
        menuState = $('#menuState');

        $('#buttonDetails').hide();
        $('#menuEditor').hide();

        $("#buttonDetails_type").change(senparc.menu.typeChanged);

        $(':input[id^=menu_button]').click(function () {
            $('#buttonDetails').show();
            var idPrefix = $(this).attr('data-root')
                ? ('menu_button' + $(this).attr('data-root'))
                : ('menu_button' + $(this).attr('data-j') + '_sub_button' + $(this).attr('data-i'));

            var keyId = idPrefix + "_key";
            var nameId = idPrefix + "_name";
            var typeId = idPrefix + "_type";
            var urlId = idPrefix + "_url";

            var txtDetailsKey = $('#buttonDetails_key');
            var txtDetailsName = $('#buttonDetails_name');
            var ddlDetailsType = $('#buttonDetails_type');
            var txtDetailsUrl = $('#buttonDetails_url');

            var hiddenButtonKey = $('#' + keyId);
            var hiddenButtonType = $('#' + typeId);
            var hiddenButtonUrl = $('#' + urlId);

            txtDetailsKey.val(hiddenButtonKey.val());
            txtDetailsName.val($('#' + nameId).val());
            ddlDetailsType.val(hiddenButtonType.val());
            txtDetailsUrl.val(hiddenButtonUrl.val());

            senparc.menu.typeChanged();

            txtDetailsKey.unbind('blur').blur(function () {
                hiddenButtonKey.val($(this).val());
            });
            ddlDetailsType.unbind('blur').blur(function () {
                hiddenButtonType.val($(this).val());
            });
            txtDetailsUrl.unbind('blur').blur(function () {
                hiddenButtonUrl.val($(this).val());
            });

            //修改当前行列样式
            var row = parseInt($(this).attr('data-i'));
            var column = parseInt($(this).attr('data-j'));
            $('#menuTable input').removeClass('currentMenuInput');
            $('#menuTable thead th').removeClass('currentMenuItem');
            $('#menuTable tbody td').removeClass('currentMenuItem');
            $(this).addClass('currentMenuInput');
            $('#menuTable thead th').eq(column + 1).addClass('currentMenuItem');
            $('#menuTable tbody tr').eq(row).find('td').eq(0).addClass('currentMenuItem');

        });

        $('#menuLogin_Submit').click(function () {
            $.getJSON('/Menu/GetToken?t=' + Math.random(), { appId: $('#menuLogin_AppId').val(), appSecret: $('#menuLogin_AppSecret').val() },
                function (json) {
                    if (json.access_token) {
                        senparc.menu.setToken(json.access_token);
                    } else {
                        alert(json.error || '执行过程有错误，请检查！');
                    }
                });
        });

        $('#menuLogin_SubmitOldToken').click(function () {
            senparc.menu.setToken($('#menuLogin_OldToken').val());
        });

        $('#btnGetMenu').click(function () {
            menuState.html('获取菜单中...');
            $.getJSON('/Menu/GetMenu?t=' + Math.random(), { token: senparc.menu.token }, function (json) {
                if (json.menu) {
                    $(':input[id^=menu_button]:not([id$=_type])').val('');
                    $('#buttonDetails:input').val('');

                    var buttons = json.menu.button;
                    //此处i与j和页面中反转
                    for (var i = 0; i < buttons.length; i++) {
                        var button = buttons[i];
                        $('#menu_button' + i + '_name').val(button.name);
                        $('#menu_button' + i + '_key').val(button.key);
                        $('#menu_button' + i + '_type').val(button.type || 'click');
                        $('#menu_button' + i + '_url').val(button.url);
                        $('#menu_button' + i + '_appid').val(button.appid);
                        $('#menu_button' + i + '_pagepath').val(button.pagepath);

                        if (button.sub_button && button.sub_button.length > 0) {
                            //二级菜单
                            for (var j = 0; j < button.sub_button.length; j++) {
                                var subButton = button.sub_button[j];
                                var idPrefix = '#menu_button' + i + '_sub_button' + j;
                                $(idPrefix + "_name").val(subButton.name);
                                $(idPrefix + "_type").val(subButton.type || 'click');
                                $(idPrefix + "_key").val(subButton.key);
                                $(idPrefix + "_url").val(subButton.url);
                                $(idPrefix + "_appid").val(subButton.appid);
                                $(idPrefix + "_pagepath").val(subButton.pagepath);
                            }
                        } else {
                            //底部菜单
                            //...
                        }
                    }

                    //显示JSON
                    $('#txtReveiceJSON').html(JSON.stringify(json));

                    menuState.html('菜单获取已完成');
                } else {
                    menuState.html(json.error || '执行过程有错误，请检查！');
                }
            });
        });

        $('#btnDeleteMenu').click(function () {
            if (!confirm('确定要删除菜单吗？此操作无法撤销！')) {
                return;
            }

            menuState.html('删除菜单中...');
            $.getJSON('/Menu/DeleteMenu?t=' + Math.random(), { token: senparc.menu.token }, function (json) {
                if (json.Success) {
                    menuState.html('删除成功，如果是误删，并且界面上有最新的菜单状态，可以立即点击【更新到服务器】按钮。');
                } else {
                    menuState.html(json.Message);
                }
            });
        });

        $('#submitMenu').click(function () {
            if (!confirm('确定要提交吗？此操作无法撤销！')) {
                return;
            }

            menuState.html('上传中...');

            $('#form_Menu').ajaxSubmit({
                dataType: 'json',
                success: function (json) {
                    if (json.Successed) {
                        menuState.html('上传成功');
                    } else {
                        menuState.html(json.Message);
                    }
                }
            });
        });

        $('#btnResetAccessToken').click(function () {
            $('#menuEditor').hide();
            $('#menuLogin').show();
        });

        $('#menuTable .control-input').hover(function () {
            var row = parseInt($(this).attr('data-i'));
            var column = parseInt($(this).attr('data-j'));

            $('#menuTable thead th').removeClass('hoverMenuItem');
            $('#menuTable tbody td').removeClass('hoverMenuItem');

            $('#menuTable thead th').eq(column + 1).addClass('hoverMenuItem');
            $('#menuTable tbody tr').eq(row).find('td').eq(0).addClass('hoverMenuItem');
        }, function () {
            $('#menuTable thead th').removeClass('hoverMenuItem');
            $('#menuTable tbody td').removeClass('hoverMenuItem');
        });
    },
    typeChanged: function () {
        var val = $('#buttonDetails_type').val().toUpperCase();
        switch (val) {
            case 'VIEW':
                $('#buttonDetails_key_area').slideUp(100);
                $('#buttonDetails_url_area').slideDown(100);
                $('#buttonDetails_miniprogram_appid_area').slideUp(100);
                $('#buttonDetails_miniprogram_page_area').slideUp(100);
                break;
            case 'CLICK':
                $('#buttonDetails_key_area').slideDown(100);
                $('#buttonDetails_url_area').slideUp(100);
                $('#buttonDetails_miniprogram_appid_area').slideUp(100);
                $('#buttonDetails_miniprogram_page_area').slideUp(100);
                break;
            case 'MINIPROGRAM':
                $('#buttonDetails_key_area').slideUp(100);
                $('#buttonDetails_url_area').slideDown(100);
                $('#buttonDetails_miniprogram_appid_area').slideDown(100);
                $('#buttonDetails_miniprogram_pagepath_area').slideDown(100);
                break;
            default:
                break;
        }
    },
    setToken: function (token) {
        senparc.menu.token = token;
        $('#tokenStr').val(token);
        $('#menuEditor').show();
        $('#menuLogin').hide();
    }
};