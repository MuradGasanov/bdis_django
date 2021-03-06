/**
 * Created by Murad Gasanov on 23.01.14.
 */

var API_BASE_URL = "api/",
    FILE_UPLOAD_LOC = {
        cancel: "Отменить",
        dropFilesHere: "Перетащите файл сюда",
        headerStatusUploaded: "Выполнено",
        headerStatusUploading: "Загрузка...",
        remove: "Удалить",
        retry: "Повторить",
        select: "Выбрать файлы для загрузки...",
        statusFailed: "Ошибка загрузки",
        statusUploaded: "Загруженно",
        statusUploading: "Загрузка...",
        statusWarning: "Внимание",
        uploadSelectedFiles: "Загрузить"
    };

(function ($) {
    var ui = kendo.ui,
        MultiSelect = ui.MultiSelect,
        keys = kendo.keys,
        SELECT = "select",
        NEXT = "nextSibling",
        PREV = "previousSibling";

    var AuthorMultiSelect = MultiSelect.extend({
        init: function (element, options) {
            var that = this;
            MultiSelect.fn.init.call(that, element, options);
        },
        options: {
            name: 'AuthorMultiSelect'
        },
        _keydown: function (e) {
            var that = this,
                key = e.keyCode,
                options = that.options,
                tag = that._currentTag,
                current = that._current,
                hasValue = that.input.val(),
                isRtl = kendo.support.isRtl(that.wrapper),
                visible = that.popup.visible();

            if (key === keys.DOWN) {
                e.preventDefault();

                if (!visible) {
                    that.open();
                    return;
                }

                if (current) {
                    current = sibling(current[0], NEXT);
                } else {
                    current = first(that.ul[0]);
                }

                if (current) {
                    that.current($(current));
                }
            } else if (key === keys.UP) {
                if (visible) {
                    if (current) {
                        current = sibling(current[0], PREV);
                    } else {
                        current = last(that.ul[0]);
                    }

                    that.current($(current));

                    if (!that._current[0]) {
                        that.close();
                    }
                }
                e.preventDefault();
            } else if ((key === keys.LEFT && !isRtl) || (key === keys.RIGHT && isRtl)) {
                if (!hasValue) {
                    tag = tag ? tag.prev() : $(that.tagList[0].lastChild);
                    if (tag[0]) {
                        that.currentTag(tag);
                    }
                }
            } else if ((key === keys.RIGHT && !isRtl) || (key === keys.LEFT && isRtl)) {
                if (!hasValue && tag) {
                    tag = tag.next();
                    that.currentTag(tag[0] ? tag : null);
                }
            } else if (key === keys.ENTER && visible) {
                if (current) {
                    if (that.trigger(SELECT, {item: current})) {
                        that._close();
                        return;
                    }
                    that._select(current);
                }

                that._change();
                that._close();
                e.preventDefault();
            } else if (key === keys.ENTER) {
                if (hasValue) {
                    that.trigger("addAuthor", hasValue);
                }
            } else if (key === keys.ESC) {
                if (visible) {
                    e.preventDefault();
                } else {
                    that.currentTag(null);
                }

                that.close();
            } else if (key === keys.HOME) {
                if (visible) {
                    that.current(first(that.ul[0]));
                } else if (!hasValue) {
                    tag = that.tagList[0].firstChild;

                    if (tag) {
                        that.currentTag($(tag));
                    }
                }
            } else if (key === keys.END) {
                if (visible) {
                    that.current(last(that.ul[0]));
                } else if (!hasValue) {
                    tag = that.tagList[0].lastChild;

                    if (tag) {
                        that.currentTag($(tag));
                    }
                }
            } else if ((key === keys.DELETE || key === keys.BACKSPACE) && !hasValue) {
                if (key === keys.BACKSPACE && !tag) {
                    tag = $(that.tagList[0].lastChild);
                }

                if (tag && tag[0]) {
                    that._unselect(tag);
                    that._change();
                    that._close();
                }
            } else {
                clearTimeout(that._typing);
                setTimeout(function () {
                    that._scale();
                });
                that._search();
            }
        }
    });

    function first(ul) {
        var item = ul.firstChild;

        if (item && item.style.display === "none") {
            item = sibling(item, NEXT);
        }

        if (item) {
            return $(item);
        }

        return item;
    }
    function last(ul) {
        var item = ul.lastChild;

        if (item && item.style.display === "none") {
            item = sibling(item, PREV);
        }

        if (item) {
            return $(item);
        }

        return item;
    }
    function sibling(item, direction) {
        item = item[direction];

        if (item && item.style.display === "none") {
            item = sibling(item, direction);
        }

        return item;
    }
    ui.plugin(AuthorMultiSelect);
})(jQuery);

(function ($) {
    $(document).ready(function (e) {
        var GRID_HEIGHT = $(window).height() - $("header#main_header").height() - $("footer#main_footer").height() - 70;
        var window_option = {
            resizable: false,
//            actions: [],
            animation: { close: { effects: "", duration: 350 },
                open: { effects: "", duration: 350 } },
            modal: true,
            width: 750,
            visible: false};
        var validator_option = {
            rules: {
                required: function (input) {
                    if (input.is("[required]")) {
                        input.val($.trim(input.val())); //удалить обертывающиепробелы
                        return input.val() !== "";
                    } else return true;
                }
            },
            messages: {
                required: "Поле не может быть пустым"
            }
        };
        $("#tab_strip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            },
            select: function (e) {
                var height = GRID_HEIGHT;
                var $this = $(e.item);
                if ($this.hasClass("grid-pager")) {
                    height = height - 34 /*toolbar*/ - 30 /*grid-header*/ - 38 /*pager*/;
                } else {
                    height = height - 34 /*toolbar*/ - 30 /*grid-header*/;
                }
                $(e.contentElement).find("div.k-grid-content").css("height", height + "px");
            }
        });
        var M_SAVE = "Сохранение...",
            M_LOAD = "Загрузка...",
            n = noty_message(M_LOAD, false);
/////////////////////////////////////// ПОДРАЗДЕЛЕНИЯ
        var subdivision = $("#subdivision").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "subdivision/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + API_BASE_URL + "subdivision/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "subdivision_id",
                        fields: { name: {type: "string"}, tel: {type: "string"} }
                    }
                },
                requestEnd: function (e) {
                    if (e.type == "destroy") {
                        $reload_author.click();
                    }
                    n.close();
                }
            },
            toolbar: [
                { template: kendo.template($("#subdivision_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            detailTemplate: kendo.template($("#subdivision_detail_template").html()),
            detailInit: subdivision_detail_init,
            columns: [
                { field: "name", title: "Название" },
                { field: "tel", title: "Телефон", width: "300px", attributes: {title: "#=tel#"} },
                { command: [
                    {   text: "Редактировать",
                        click: function (e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_subdivision_edit").val("true");
                            subdivision_model.set("subdivision_id", dataItem.subdivision_id);
                            subdivision_model.set("name", "");
                            subdivision_model.set("name", dataItem.name);
                            subdivision_model.set("tel", "");
                            subdivision_model.set("tel", dataItem.tel);
                            subdivision_window.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid");

        window_option.width = 500;
        var subdivision_window = $("#change_subdivision_window").kendoWindow(window_option).data("kendoWindow");
        var subdivision_model = kendo.observable({
            subdivision_id: 0,
            name: "",
            tel: ""
        });
        var $change_subdivision = $("#change_subdivision");
        kendo.bind($change_subdivision, subdivision_model);
        var subdivision_validator = $change_subdivision.kendoValidator(validator_option).data("kendoValidator");

        $(".add_subdivision").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_subdivision_edit").val(false);
            subdivision_model.set("subdivision_id", 0);
            subdivision_model.set("name", "");
            subdivision_model.set("tel", "");
            subdivision_window.center().open();
        });

        $("#subdivision_cancel").click(function (e) {
            subdivision_window.close();
            return false;
        });

        function check_response_subdivision(d) {
            var data = subdivision.dataSource;
            var item = data.get(d.subdivision_id);
            if (item) {
                item.name = d.name;
                item.tel = d.tel;
            } else {
                item = {
                    subdivision_id: d.subdivision_id,
                    name: d.name,
                    tel: d.tel
                };
                data.add(item);
            }
            n.close();
            subdivision.refresh();
            subdivision_window.close();
        }

        $("#subdivision_save").click(function (e) {
            if (!subdivision_validator.validate()) return false;
            var send = {
                subdivision_id: subdivision_model.get("subdivision_id"),
                name: subdivision_model.get("name"),
                tel: subdivision_model.get("tel")
            };
            n = noty_message(M_SAVE, false);
            if ($("#is_subdivision_edit").val() === "false") {
                $.post(BASE_URL + API_BASE_URL + "subdivision/create/",
                    {item: JSON.stringify(send) }, check_response_subdivision, "json");
            } else {
                $.post(BASE_URL + API_BASE_URL + "subdivision/update/",
                    {item: JSON.stringify(send) }, check_response_subdivision, "json");
            }
            return false;
        });

        var $reload_subdivision = $(".reload_subdivision");
        $reload_subdivision.click(function (e) {
            n = noty_message(M_LOAD, false);
            subdivision.dataSource.read();
            subdivision.refresh();
            return false;
        });
/////////////////////////////////////// \\ПОДРАЗДЕЛЕНИЯ

/////////////////////////////////////// АВТОРЫ
        var authors = $("#authors").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "authors/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + API_BASE_URL + "authors/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(options)};
                        }
                    }
                },
                schema: {
                    model: {
                        id: "author_id",
                        fields: {
                            name: {
                                type: "string",
                                validation: {
                                    required: { message: "Поле не может быть пустым" }
                                }
                            },
                            surname: { type: "string"},
                            patronymic: { type: "string"},
                            full_name: { type: "string"},
                            tel: { type: "string"},
                            post: { type: "string"},
                            mail: { type: "string"},
                            department: { defaultValue: {department_id: "", name: ""} }
                        }
                    }
                },
                requestEnd: function (e) {
                    n.close();
                    if ((e.type == "update") || (e.type == "destroy")) {
                        $reload_intellectual_property.click();
                    }
                }
            },
            toolbar: [
                { template: kendo.template($("#authors_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            columns: [
                { field: "full_name", title: "ФИО", width: "250px" },
                { field: "post", title: "Учёные степени и звания", width: "300px", attributes: {title: "#=post#"} },
                { field: "tel", title: "Телефон", attributes: {title: "#=tel#"} },
                { field: "mail", title: "Электронный адрес", attributes: {title: "#=mail#"} },
                { field: "department", title: "Подразделение", width: "200px", attributes: {title: ""}, template: "#=department.name#"},
                { command: [
                    {   text: "Редактировать",
                        click: function (e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_author_edit").val("true");
                            author_model.set("author_id", dataItem.author_id);
                            author_model.set("surname", dataItem.surname);
                            author_model.set("name", dataItem.name);
                            author_model.set("patronymic", dataItem.patronymic);
                            author_model.set("post", dataItem.post);
                            author_model.set("tel", dataItem.tel);
                            author_model.set("mail", dataItem.mail);
                            author_subdivision.value(false);
                            author_model.get("subdivisions").read();
                            author_model.set("department", dataItem.department);
                            author_model.get("departments").read();
                            author_window.center().open();
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: "250px", attributes: { style: "text-align: center;"} }
            ]
        }).data("kendoGrid"); /// TODO: выводить количество патентов у авторов

        window_option.width = 500;
        var author_window = $("#change_author_window").kendoWindow(window_option).data("kendoWindow");
        var author_model = kendo.observable({
            author_id: 0,
            surname: "",
            name: "",
            patronymic: "",
            post: "",
            tel: "",
            mail: "",
            subdivisions: new kendo.data.DataSource({   type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "subdivision/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            subdivision: "",
            departments: new kendo.data.DataSource({   type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "department/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            department: ""
        });
        var $change_author = $("#change_author");
        kendo.bind($change_author, author_model);
        var author_subdivision = $("#author_subdivision").data("kendoDropDownList");
        var author_validator = $change_author.kendoValidator(validator_option).data("kendoValidator");

        $(".add_author").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            $("#is_author_edit").val(false);
            if ($(this).hasClass("for_i_p")) {
                $("#is_for_i_p").val(true);
            }
            author_model.set("author_id", 0);
            author_model.set("surname", "");
            author_model.set("name", "");
            author_model.set("patronymic", "");
            author_model.set("post", "");
            author_model.set("tel", "");
            author_model.set("mail", "");
            author_subdivision.value(false);
            author_model.get("subdivisions").read();
            author_model.get("departments").read();
            author_model.set("department", "");
            author_window.center().open();
        });

        $("#author_cancel").click(function (e) {
            author_window.close();
            return false;
        });

        function check_response_author(d) {
            var data = authors.dataSource;
            var item = data.get(d.author_id);
            if (item) { //обновить в таблице
                item.author_id = d.author_id;
                item.surname = d.surname;
                item.full_name = d.full_name;
                item.name = d.name;
                item.patronymic = d.patronymic;
                item.post = d.post;
                item.tel = d.tel;
                item.mail = d.mail;
                item.department = d.department;
            } else { //добавить в таблицу
                item = {
                    author_id: d.author_id,
                    surname: d.surname,
                    name: d.name,
                    full_name: d.full_name,
                    patronymic: d.patronymic,
                    post: d.post,
                    tel: d.tel,
                    mail: d.mail,
                    department: d.department
                };
                data.add(item);
            }
            if ($("#is_for_i_p").val() == "true") { //Добавить нового автора "из окна"/
                $("#is_for_i_p").val(false);        /// вызываемого в окне редактирования ИС
                if (authors_multiselect) {
                    authors_multiselect.dataSource.add(d);
                    var current_values = [].concat(authors_multiselect.value());
                    current_values.push(d.author_id);
                    authors_multiselect.value(current_values);
                }
            }
            n.close();
            authors.refresh();
            author_window.close();
        }

        $("#author_save").click(function (e) {
            if (!author_validator.validate()) return false;
            var department = author_model.get("department");
            if (typeof department == "object") {
                department = department.department_id
            }
            var send = {
                author_id: author_model.get("author_id"),
                surname: author_model.get("surname"),
                name: author_model.get("name"),
                patronymic: author_model.get("patronymic"),
                post: author_model.get("post"),
                tel: author_model.get("tel"),
                mail: author_model.get("mail"),
                department: department
            };
            n = noty_message(M_SAVE, false);
            if ($("#is_author_edit").val() === "false") {
                $.post(BASE_URL + API_BASE_URL + "authors/create/",
                    {item: JSON.stringify(send) }, check_response_author, "json");
            } else {
                $.post(BASE_URL + API_BASE_URL + "authors/update/",
                    {item: JSON.stringify(send) }, check_response_author, "json");
            }
            return false;
        });

        var $reload_author = $(".reload_author");
        $reload_author.click(function (e) {
            n = noty_message(M_LOAD, false)
            authors.dataSource.read();
            authors.refresh();
            return false;
        });
/////////////////////////////////////// \\АВТОРЫ

///////////////////////////////////////  ВИДЫ ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТИ
//
//        var document_types = $("#document_types").kendoGrid({
//            dataSource: {
//                type: "json",
//                transport: {
//                    read: {
//                        url: BASE_URL + API_BASE_URL + "document_types/read/",
//                        dataType: "json",
//                        type: "POST"
//                    },
//                    destroy: {
//                        url: BASE_URL + API_BASE_URL + "document_types/destroy/",
//                        dataType: "json",
//                        type: "POST"
//                    },
//                    parameterMap: function (options, operation) {
//                        if (operation !== "read" && options) {
//                            return {item: kendo.stringify(options)};
//                        }
//                    }
//                },
//                schema: {
//                    model: {
//                        id: "doc_type_id",
//                        fields: {
//                            name: {
//                                validation: {
//                                    required: { message: "Поле не может быть пустым" }
//                                }
//                            }
//                        }
//                    }
//                },
//                requestEnd: function(e) {
//                    if ((e.type == "update") || (e.type == "destroy")) {
//                        $reload_intellectual_property.click();
//                    }
//                }
//            },
//            toolbar: [
//                { template: kendo.template($("#document_types_header_template").html()) }
//            ],
//            height: GRID_HEIGHT,
//            sortable: true,
//            editable: {
//                mode: "inline",
//                confirmation: "Вы уверены, что хотите удалить запись?",
//                confirmDelete: "Да",
//                cancelDelete: "Нет"
//            },
//            columns: [
//                { field: "name", title: "Вид интеллектуального права"},
//                { command: [
//                    {   text: "Редактировать",
//                        click: function(e) {
//                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
//                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
//                            $("#is_document_types_edit").val("true");
//                            document_types_model.set("doc_type_id", dataItem.doc_type_id);
//                            document_types_model.set("name", dataItem.name);
//                            document_types_window.center().open();
//                        }
//                    },
//                    { name: "destroy", text: "Удалить" }
//                ], width: "250px", attributes: { style: "text-align: center;"} }
//            ]
//        }).data("kendoGrid");
//
//        window_option.width = 500;
//        var document_types_window = $("#change_document_types_window").kendoWindow(window_option).data("kendoWindow");
//        var document_types_model = kendo.observable({
//            doc_type_id: 0,
//            name: ""
//        });
//        var $change_document_types = $("#change_document_types");
//        kendo.bind($change_document_types, document_types_model);
//        var document_types_validator = $change_document_types.kendoValidator(validator_option).data("kendoValidator");
//
//        $(".add_document_type").click(function (e) {
//            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
//            $("#is_document_types_edit").val(false);
//            document_types_model.set("doc_type_id", 0);
//            document_types_model.set("name", "");
//            document_types_window.center().open();
//        });
//
//        $("#document_types_cancel").click(function (e) {
//            document_types_window.close();
//            return false;
//        });
//
//        function check_response_document_types(d) {
//            var data = document_types.dataSource;
//            var item = data.get(d.doc_type_id);
//            if (item) {
//                item.name = d.name;
//            } else {
//                item = {
//                    doc_type_id: d.doc_type_id,
//                    name: d.name
//                };
//                data.add(item);
//            }
//            document_types.refresh();
//            document_types_window.close();
//        }
//
//        $("#document_types_save").click(function (e) {
//            if (!document_types_validator.validate()) return false;
//            var send = {
//                doc_type_id: document_types_model.get("doc_type_id"),
//                name: document_types_model.get("name")
//            };
//            if ($("#is_document_types_edit").val() === "false") {
//               $.post(BASE_URL + API_BASE_URL + "document_types/create/",
//                   {item: JSON.stringify(send) }, check_response_document_types, "json");
//            } else {
//                $.post(BASE_URL + API_BASE_URL + "document_types/update/",
//                    {item: JSON.stringify(send) }, check_response_document_types, "json");
//            }
//            return false;
//        });
//
//        var $reload_document_type = $(".reload_document_type");
//        $reload_document_type.click(function (e) {
//            document_types.dataSource.read();
//            document_types.refresh();
//            return false;
//        });
///////////////////////////////////////  \\ВИДЫ ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТИ

///////////////////////////////////////  НАПРАВЛЕНИЯ
//        var directions = $("#directions").kendoGrid({
//            dataSource: {
//                type: "json",
//                transport: {
//                    read: {
//                        url: BASE_URL + API_BASE_URL + "directions/read/",
//                        dataType: "json",
//                        type: "POST"
//                    },
//                    destroy: {
//                        url: BASE_URL + API_BASE_URL + "directions/destroy/",
//                        dataType: "json",
//                        type: "POST"
//                    },
//                    parameterMap: function (options, operation) {
//                        if (operation !== "read" && options) {
//                            return {item: kendo.stringify(options)};
//                        }
//                    }
//                },
//                schema: {
//                    model: {
//                        id: "direction_id",
//                        fields: {
//                            name: {
//                                validation: {
//                                    required: { message: "Поле не может быть пустым" }
//                                }
//                            }
//                        }
//                    }
//                },
//                requestEnd: function(e) {
//                    if ((e.type == "update") || (e.type == "destroy")) {
//                        $reload_intellectual_property.click();
//                    }
//                }
//            },
//            toolbar: [
//                { template: kendo.template($("#directions_header_template").html()) }
//            ],
//            height: GRID_HEIGHT,
//            sortable: true,
//            editable: {
//                mode: "inline",
//                confirmation: "Вы уверены, что хотите удалить запись?",
//                confirmDelete: "Да",
//                cancelDelete: "Нет"
//            },
//            columns: [
//                { field: "name", title: "Направление"},
//                { command: [
//                    {   text: "Редактировать",
//                        click: function(e) {
//                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
//                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
//                            $("#is_directions_edit").val("true");
//                            directions_model.set("direction_id", dataItem.direction_id);
//                            directions_model.set("name", dataItem.name);
//                            directions_window.center().open();
//                        }
//                    },
//                    { name: "destroy", text: "Удалить" }
//                ], width: "250px", attributes: { style: "text-align: center;"} }
//            ]
//        }).data("kendoGrid");
//
//        window_option.width = 500;
//        var directions_window = $("#change_directions_window").kendoWindow(window_option).data("kendoWindow");
//        var directions_model = kendo.observable({
//            direction_id: 0,
//            name: ""
//        });
//        var $change_directions = $("#change_directions");
//        kendo.bind($change_directions, directions_model);
//        var directions_validator = $change_directions.kendoValidator(validator_option).data("kendoValidator");
//
//        $(".add_direction").click(function (e) {
//            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
//            $("#is_directions_edit").val(false);
//            directions_model.set("direction_id", 0);
//            directions_model.set("name", "");
//            directions_window.center().open();
//        });
//
//        $("#directions_cancel").click(function (e) {
//            directions_window.close();
//            return false;
//        });
//
//        function check_response_directions(d) {
//            var data = directions.dataSource;
//            var item = data.get(d.direction_id);
//            if (item) {
//                item.name = d.name;
//            } else {
//                item = {
//                    direction_id: d.direction_id,
//                    name: d.name
//                };
//                data.add(item);
//            }
//            directions.refresh();
//            directions_window.close();
//        }
//
//        $("#directions_save").click(function (e) {
//            if (!directions_validator.validate()) return false;
//            var send = {
//                direction_id: directions_model.get("direction_id"),
//                name: directions_model.get("name")
//            };
//            if ($("#is_directions_edit").val() === "false") {
//               $.post(BASE_URL + API_BASE_URL + "directions/create/",
//                   {item: JSON.stringify(send) }, check_response_directions, "json");
//            } else {
//                $.post(BASE_URL + API_BASE_URL + "directions/update/",
//                    {item: JSON.stringify(send) }, check_response_directions, "json");
//            }
//            return false;
//        });
//
//        var $reload_direction = $(".reload_direction");
//        $reload_direction.click(function (e) {
//            directions.dataSource.read();
//            directions.refresh();
//            return false;
//        });
///////////////////////////////////////  \\НАПРАВЛЕНИЯ

///////////////////////////////////////  КЛЮЧЕВЫЕ СЛОВА
//        var tags = $("#tags").kendoGrid({
//            dataSource: {
//                type: "json",
//                transport: {
//                    read: {
//                        url: BASE_URL + API_BASE_URL + "tags/read/",
//                        dataType: "json",
//                        type: "POST"
//                    },
//                    destroy: {
//                        url: BASE_URL + API_BASE_URL + "tags/destroy/",
//                        dataType: "json",
//                        type: "POST"
//                    },
//                    parameterMap: function (options, operation) {
//                        if (operation !== "read" && options) {
//                            return {item: kendo.stringify(options)};
//                        }
//                    }
//                },
//                schema: {
//                    model: {
//                        id: "tag_id",
//                        fields: {
//                            name: {
//                                validation: {
//                                    required: { message: "Поле не может быть пустым" }
//                                }
//                            }
//                        }
//                    }
//                },
//                requestEnd: function(e) {
//                    if ((e.type == "update") || (e.type == "destroy")) {
//                        $reload_intellectual_property.click();
//                    }
//                }
//            },
//            toolbar: [
//                { template: kendo.template($("#tags_header_template").html()) }
//            ],
//            height: GRID_HEIGHT,
//            sortable: true,
//            editable: {
//                mode: "inline",
//                confirmation: "Вы уверены, что хотите удалить запись?",
//                confirmDelete: "Да",
//                cancelDelete: "Нет"
//            },
//            columns: [
//                { field: "name", title: "Направление"},
//                { command: [
//                    {   text: "Редактировать",
//                        click: function(e) {
//                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
//                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
//                            $("#is_tags_edit").val("true");
//                            tags_model.set("tag_id", dataItem.tag_id);
//                            tags_model.set("name", dataItem.name);
//                            tags_window.center().open();
//                        }
//                    },
//                    { name: "destroy", text: "Удалить" }
//                ], width: "250px", attributes: { style: "text-align: center;"} }
//            ]
//        }).data("kendoGrid");
//
//        window_option.width = 500;
//        var tags_window = $("#tags_window").kendoWindow(window_option).data("kendoWindow");
//        var tags_model = kendo.observable({
//            tag_id: 0,
//            name: ""
//        });
//        var $change_tags = $("#change_tags");
//        kendo.bind($change_tags, tags_model);
//        var tags_validator = $change_tags.kendoValidator(validator_option).data("kendoValidator");
//
//        $(".add_tags").click(function (e) {
//            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
//            $("#is_tags_edit").val(false);
//            tags_model.set("tag_id", 0);
//            tags_model.set("name", "");
//            tags_window.center().open();
//        });
//
//        $("#tags_cancel").click(function (e) {
//            tags_window.close();
//            return false;
//        });
//
//        function check_response_tags(d) {
//            var data = tags.dataSource;
//            var item = data.get(d.tag_id);
//            if (item) {
//                item.name = d.name;
//            } else {
//                item = {
//                    tag_id: d.tag_id,
//                    name: d.name
//                };
//                data.add(item);
//            }
//            tags.refresh();
//            tags_window.close();
//        }
//
//        $("#tags_save").click(function (e) {
//            if (!tags_validator.validate()) return false;
//            var send = {
//                tag_id: tags_model.get("tag_id"),
//                name: tags_model.get("name")
//            };
//            if ($("#is_tags_edit").val() === "false") {
//               $.post(BASE_URL + API_BASE_URL + "tags/create/",
//                   {item: JSON.stringify(send) }, check_response_tags, "json");
//            } else {
//                $.post(BASE_URL + API_BASE_URL + "tags/update/",
//                    {item: JSON.stringify(send) }, check_response_tags, "json");
//            }
//            return false;
//        });
//
//        var $reload_tags = $(".reload_tags");
//        $reload_tags.click(function (e) {
//            tags.dataSource.read();
//            tags.refresh();
//            return false;
//        });
///////////////////////////////////////  \\КЛЮЧЕВЫЕ СЛОВА

///////////////////////////////////////  ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТЬ
        var intellectual_property = $("#intellectual_property").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "intellectual_property/read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: BASE_URL + API_BASE_URL + "intellectual_property/destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
//                        console.log(options, operation);
                        if (operation !== "read" && options) {
                            return {item: kendo.stringify(
                                { intellectual_property_id: options.intellectual_property_id }
                            )};
                        } else if (operation == "read" && options) {
                            var send = {
                                take: options.take,
                                skip: options.skip
                            };
                            if (options.filter) {
                                send.filters = options.filter.filters;
                            }
                            return { options: kendo.stringify(send) };
                        }
                    }
                },
                pageSize: 20,
                serverPaging: true,
                serverFiltering: true,
                schema: {
                    data: "items",
                    total: "total",
                    model: {
                        id: "intellectual_property_id",
                        fields: {
                            name: { type: "string" },
                            code: { type: "string" },
                            doc_type: {defaultValue: {doc_type_id: "", name: ""}},
                            direction: {defaultValue: {direction_id: "", name: ""}},
                            authors: { type: "string" },
                            authors_id: { defaultValue: [] },
                            tags: { type: "string" },
                            tags_id: { defaultValue: [] }
                        }
                    }
                },
                requestEnd: function (e) {
                    n.close();
                }
            },
            pageable: {
                messages: {
                    display: "Показано {0}-{1} из {2} записей",
                    empty: "Нет данных для отображения",
                    first: "Первая страница",
                    itemsPerPage: "записей на странице",
                    last: "Последняя страница",
                    next: "Следующая страница",
                    of: "из {0}",
                    page: "Страница",
                    previous: "Предыдущая страница",
                    refresh: "Обновить"
                }
            },
            toolbar: [
                { template: kendo.template($("#intellectual_property_header_template").html()) }
            ],
            height: GRID_HEIGHT,
            sortable: true,
            filterable: { extra: false,
                operators: { string: { contains: "Содержат" } },
                messages: {
                    info: "Показать записи, которые:",
                    and: "и",
                    or: "или",
                    filter: "Применить",
                    clear: "Очистить"
                }
            },
            editable: {
                mode: "inline",
                confirmation: "Вы уверены, что хотите удалить запись?",
                confirmDelete: "Да",
                cancelDelete: "Нет"
            },
            detailTemplate: kendo.template($("#intellectual_property_detail_template").html()),
            detailInit: intellectual_property_detail_init,
            columns: [
                { field: "code", title: "Код", width: 150, filterable: true},
                { field: "name", title: "Наименование", width: 300, filterable: true},
                { field: "doc_type", title: "Тип", width: 150, filterable: false,
                    template: "#if (doc_type) if (doc_type.name) {# #=doc_type.name# # } #"},
                { field: "end_date", title: "Срок действия истекает", width: 150, filterable: false,
                    template: "#if (end_date) {# #=kendo.toString(new Date(end_date), 'dd.MM.yyyy')# #} #"},
                { field: "direction", title: "Направление", filterable: false,
                    template: "#if (direction) if (direction.name) {# #=direction.name# # } #"},
                { field: "authors", title: "Авторы", filterable: false },
                { field: "tags", title: "Ключевые слова", filterable: false },
                { command: [
                    {   text: "Редактировать",
                        click: function (e) {
                            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            $("#is_intellectual_property_edit").val("true");
                            n = noty_message(M_LOAD, false);
                            intellectual_property_model.get("doc_types").read();
                            intellectual_property_model.get("directions").read();
                            intellectual_property_model.get("tags_source").read();
                            authors_multiselect.dataSource.read();
                            $.post(API_BASE_URL + "file/get_list/",
                                {item: JSON.stringify({intellectual_property_id: dataItem.intellectual_property_id})},
                                function (data) {
                                    reset_file_uploader();
                                    console.log(dataItem);
                                    $file_uploader._renderInitialFiles(data);
                                    intellectual_property_model.set("intellectual_property_id", dataItem.intellectual_property_id);
                                    intellectual_property_model.set("name", "");
                                    intellectual_property_model.set("name", dataItem.name);
                                    intellectual_property_model.set("code", "");
                                    intellectual_property_model.set("code", dataItem.code);
                                    intellectual_property_model.set("doc_type", "");
                                    intellectual_property_model.set("doc_type", dataItem.doc_type.doc_type_id);
                                    intellectual_property_model.set("direction", "");
                                    intellectual_property_model.set("direction", dataItem.direction.direction_id);
                                    $start_date.value(date_parser(dataItem.start_date));
                                    $public_date.value(date_parser(dataItem.public_date));
                                    $end_date.value(date_parser(dataItem.end_date));
                                    intellectual_property_model.set("tags", "");
                                    intellectual_property_model.set("tags", dataItem.tags);
                                    authors_multiselect.dataSource.filter({});
                                    authors_multiselect.value(dataItem.authors_id);
                                    intellectual_property_window.center().open();
                                    n.close();
                                }, "json");
                        }
                    },
                    { name: "destroy", text: "Удалить" }
                ], width: 230, attributes: { style: "text-align: center;"} }
            ]
//            save: function (e) {
//                var new_name = e.model.name;
//                var data = intellectual_property.dataSource.data();
//                var result;
//                if (e.model.intellectual_property_id != "") { ///возможно это редактирование
//                    result = $.grep(data,
//                        function (o) {
//                            if (o.intellectual_property_id != e.model.intellectual_property_id) {
//                                return o.name.toUpperCase() == new_name.toUpperCase();
//                            } else { //проверка, есть ли такие
//                                return false;
//                            }
//                        }
//                    );
//                    if (result.length > 0) {
//                        noty_error("Такое имя уже добавлен");
//                        e.preventDefault();
//                    }
//                } else { //возможно это добавление, (id == "")
//                    result = $.grep(data,
//                        function (o) {
//                            if (o.intellectual_property_id != "") {
//                                return o.name.toUpperCase() == new_name.toUpperCase();
//                            } else { //проверка, есть ли такие
//                                return false;
//                            }
//                        }
//                    );
//                    if (result.length > 0) {
//                        noty_error("Такое имя уже добавлен");
//                        e.preventDefault();
//                    }
//                }
//            }
        }).data("kendoGrid");

        var $reload_intellectual_property = $(".reload_intellectual_property");
        $reload_intellectual_property.click(function (e) {
            n = noty_message(M_LOAD, false);
            intellectual_property.dataSource.read();
            intellectual_property.refresh();
            return false;
        });

        window_option.width = 750;
        var intellectual_property_window = $("#change_intellectual_property_window").kendoWindow(window_option).data("kendoWindow");

        var authors_multiselect_data_source = new kendo.data.DataSource({
                type: "json",
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: BASE_URL + API_BASE_URL + "authors/read/",
                            dataType: "json",
                            success: function (result) {
//                                var data = [];
//                                for (var i = 0; i < result.length; i++) {
//                                    data.push({
//                                        author_id: result[i].author_id,
//                                        name: [result[i].surname, result[i].name, result[i].patronymic].join(" "),
//                                        department: result[i].department.name
//                                    })
//                                }
                                options.success(result);
                            }
                        });
                    }
                }
            });
        window.authors_multiselect = $("#authors_multiselect").kendoAuthorMultiSelect({
                placeholder: "Выберите авторов...",
                dataTextField: "full_name",
                dataValueField: "author_id",
                itemTemplate: '<span class="k-state-default"><b>#=full_name#</b>#if(data.department.name){ #<p><i>#=data.department.name#</i></p># } #</span>',
                dataSource: authors_multiselect_data_source
            }).data("kendoAuthorMultiSelect");
        authors_multiselect.wrapper.css({width: "500px", display: "inline-block"});
        authors_multiselect.bind("addAuthor", function(newAuthor) { //Добавить нового автора "из строки"
            var that = this;
            var fio = $.trim(newAuthor);
            fio = fio.replace(/\s+/g, " ").split(" ");
            if (fio.length < 2) return false;
            var send = {
                author_id: 0,
                surname: fio[0],
                name: fio[1],
                patronymic: fio.length == 3 ? fio[2] : "",
                post: "", tel: "", mail: "", department: ""
            };
            n = noty_message(M_LOAD, false);
            $.post(BASE_URL + API_BASE_URL + "authors/create/",
                { item: JSON.stringify(send) },
                function (data) {
                    n.close();
                    that.dataSource.add(data);
                    console.log(that == authors_multiselect)
                    var current_value = [].concat(that.value());
                    current_value.push(data.author_id);
                    that.dataSource.filter({});
                    that.value(current_value);
                }, "json");
            return false;
        });

        var $file_uploader = $("#file_uploader").kendoUpload({
            multiple: true,
            async: {
                saveUrl: API_BASE_URL + "file/upload/",
                saveField: "files",
                removeUrl: API_BASE_URL + "file/delete/",
                autoUpload: false
            },
            localization: FILE_UPLOAD_LOC,
            template: kendo.template($('#fileTemplate').html()),
            files: [],
            intellect_prop_id: 0,
            success: function (e) {
                if (e.operation == "upload") {
                    intellectual_property_window.close();
                    var that = this;
                    $.post(API_BASE_URL + "file/get_list/",
                        {item: JSON.stringify({intellectual_property_id: this.options.intellect_prop_id})},
                        function (data) {
                            that.wrapper.find("ul.k-upload-files.k-reset").remove();
//                                that.wrapper.find("li.k-file.k-file-success").remove();
                            that._renderInitialFiles(data);
                        });
                }
            },
            select: function (e) {
            },
            upload: function (e) {
                var f = e.files;
                for (var i = 0; i < f.length; i++) {
                    for (var j = i + 1; j < f.length; j++) {
                        if ((f[i].name == f[j].name) &&
                            (f[i].size == f[j].size) &&
                            (f[i].extension == f[j].extension)) {
                            noty_error("Не загружайте одинаковые файлы!");
                            e.preventDefault();
                            return;
                        }
                    }
                }
//                console.log(e);
                e.data = {item: JSON.stringify({intellectual_property_id: this.options.intellect_prop_id})};
            },
            remove: function (e) {
                var files = e.files;
                e.data = {item: JSON.stringify(files)};
                if (!confirm("Вы уверены, что хотите удалить " + files[0].name + "?")) {
                    e.preventDefault();
                }
            }
        }).data("kendoUpload");
        $file_uploader.wrapper.removeClass("k-upload-empty").css("margin", "0 0 .6em");

        function reset_file_uploader() {
            $file_uploader.wrapper.find("strong.k-upload-status.k-upload-status-total").empty();
            $file_uploader.wrapper.find("ul.k-upload-files.k-reset").remove();
            $file_uploader._renderInitialFiles([]);
        }

        var $end_date = $("#end_date").kendoDatePicker({
            culture: "ru-RU",
            parseFormats: ["dd,MM,yyyy"]
        }).data("kendoDatePicker");

        var $public_date = $("#public_date").kendoDatePicker({
            culture: "ru-RU",
            parseFormats: ["dd,MM,yyyy"]
        }).data("kendoDatePicker");

        var $start_date = $("#start_date").kendoDatePicker({
            culture: "ru-RU",
            parseFormats: ["dd,MM,yyyy"]
        }).data("kendoDatePicker");

        var intellectual_property_model = kendo.observable({
            intellectual_property_id: 0,
            name: "",
            code: "",

            doc_types: new kendo.data.DataSource({   type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "document_types/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            doc_type: "",

            directions: new kendo.data.DataSource({
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "directions/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            direction: "",

            tags_source: new kendo.data.DataSource({
                type: "json",
                transport: {
                    read: {
                        url: BASE_URL + API_BASE_URL + "tags/read/",
                        dataType: "json",
                        type: "POST"
                    }
                }
            }),
            tags: "",

            cascade_set_end_date: function(e) { //автоматически устанавливает дату оканчания срока действия
                var that = this,
                    current_start_date = that.start_date;
                if (Object.prototype.toString.call(current_start_date) === '[object Date]') {
                    if (!isNaN(current_start_date.setFullYear())) {
                        current_start_date.setFullYear(current_start_date.getFullYear() + 10);
                        that.set("end_date", current_start_date);
                    }
                }
            }
        });
        kendo.bind($("#change_intellectual_property"), intellectual_property_model);

        var intellectual_property_validator = $("#change_intellectual_property").kendoValidator({
            rules: {
                required: function (input) {
                    if (input.is("[required]")) {
                        return $.trim(input.val()) !== "";
                    } else return true;
                }
            },
            messages: {
                required: "Поле не может быть пустым"
            }
        }).data("kendoValidator");

        $(".add_intellectual_property").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            reset_file_uploader();
            $("#is_intellectual_property_edit").val("false");
            intellectual_property_model.set("intellectual_property_id", 0);
            intellectual_property_model.set("name", "");
            intellectual_property_model.set("code", "");
            intellectual_property_model.set("doc_type", "");
            intellectual_property_model.set("direction", "");
            $start_date.value(new Date(""));
            $public_date.value(new Date(""));
            $end_date.value(new Date(""));
            authors_multiselect.dataSource.read();
            authors_multiselect.dataSource.filter({});
            authors_multiselect.value([]);
            intellectual_property_model.get("doc_types").read();
            intellectual_property_model.get("directions").read();
            intellectual_property_model.set("tags", "");
            intellectual_property_model.get("tags_source").read();
            intellectual_property_window.center().open();
        });

        $("#intellectual_property_cancel").click(function (e) {
            intellectual_property_window.close();
            return false;
        });

        function check_response_intellectual_property(d) {
//            var data = intellectual_property.dataSource;
//            var item = data.get(d.intellectual_property_id);
//            if (item) {
//                item.name = d.name;
//                item.code = d.code;
//                item.doc_type = d.doc_type;
//                item.direction = d.direction;
//                item.authors = d.authors;
//                item.tags = d.tags;
//                item.start_date = d.start_date;
//                item.public_date = d.public_date;
//                item.end_date = d.end_date;
//            } else {
//                item = {
//                    intellectual_property_id: d.intellectual_property_id,
//                    name: d.name,
//                    code: d.code,
//                    doc_type: d.doc_type,
//                    direction: d.direction,
//                    authors: d.authors,
//                    tags: d.tags,
//                    start_date: d.start_date,
//                    public_date: d.public_date,
//                    end_date: d.end_date
//                };
//                data.add(item);
//            }
            $file_uploader.options.intellect_prop_id = d.intellectual_property_id;
            var is_upload = $("#change_intellectual_property_window button.k-button.k-upload-selected").click();
            if (is_upload.length == 0) {
                intellectual_property_window.close();
            }

//            $reload_direction.click();
//            $reload_document_type.click();
//            $reload_tags.click();

            n.close();
//            intellectual_property.refresh();
            intellectual_property.dataSource.read();
//            intellectual_property_window.close();
        }

        function tag_splitter(tags) {
            tags = tags.replace(/\s+/g, ' ');
            tags = $.trim(tags);
            while (tags[0] == ",") tags = tags.substr(1);
            while (tags[tags.length - 1] == ",") tags = tags.substr(0, tags.length - 1);
            tags = tags.split(",");
            var result = [];
            $.each(tags, function (i, tag) {
                tag = $.trim(tag);
                if (tag.length > 0)
                    if ($.inArray(tag, result) == -1) result.push(tag);
            });
            return result;
        }

        function date_converter(date) {
            if (Object.prototype.toString.call(date) === '[object Date]') {
                if (!isNaN(date.getFullYear())) {
                    var y = date.getFullYear(),
                        m = date.getMonth() + 1,
                        d = date.getDate();
                    return [y, m, d ].join("-");
                }
            }
            return "";
        }

        function date_parser(date) {
            if (date) {
                return new Date(date);
            } else {
                return "";
            }
        }

        $("#intellectual_property_save").click(function (e) {
            if (!intellectual_property_validator.validate()) return false;
            var doc_type = intellectual_property_model.get("doc_type");
            if (!doc_type) {
                doc_type = ""
            }
            var direction = intellectual_property_model.get("direction");
            if (!direction) {
                direction = ""
            }
            var tags = intellectual_property_model.get("tags");
            if (tags.length > 0) {
                tags = tag_splitter(tags);
            } else {
                tags = []
            }
            var start_date = date_converter($start_date.value()),
                public_date = date_converter($public_date.value()),
                end_date = date_converter($end_date.value());

            var send = {
                intellectual_property_id: intellectual_property_model.get("intellectual_property_id"),
                name: intellectual_property_model.get("name"),
                code: intellectual_property_model.get("code"),
                doc_type: doc_type,
                direction: direction,
                start_date: start_date,
                public_date: public_date,
                end_date: end_date,
                authors: authors_multiselect.value(),
                tags: tags
            };
            n = noty_message(M_SAVE, false);
            if ($("#is_intellectual_property_edit").val() === "false") {
                $.post(BASE_URL + API_BASE_URL + "intellectual_property/create/",
                    {item: JSON.stringify(send) }, check_response_intellectual_property, "json");
            } else {
                $.post(BASE_URL + API_BASE_URL + "intellectual_property/update/",
                    {item: JSON.stringify(send) }, check_response_intellectual_property, "json");
            }
            return false;
        });
///////////////////////////////////////  \\ИНТЕЛЛЕКТУАЛ. СОБСТВЕННОСТЬ

        $("#logout").click(function () {
            noty_confirm("Выйти?", function () {
                window.location = "/logout/"
            });
            return false;
        });
    });
})(jQuery);
///////////////////////////////////////  ОТДЕЛЫ
function subdivision_detail_init(e) {
    var detailRow = e.detailRow;
    var subdivision_id = e.data.subdivision_id;

    var department_dataSource = new kendo.data.DataSource({
        type: "json",
        transport: {
            read: {
                url: BASE_URL + API_BASE_URL + "department/read/",
                type: "POST",
                dataType: "json"
            },
            destroy: {
                url: BASE_URL + API_BASE_URL + "department/destroy/",
                dataType: "json",
                type: "POST"
            },
            create: {
                url: BASE_URL + API_BASE_URL + "department/create/",
                dataType: "json",
                type: "POST"
            },
            update: {
                url: BASE_URL + API_BASE_URL + "department/update/",
                dataType: "json",
                type: "POST"
            },
            parameterMap: function (options, operation) {
                if (operation == "read") {
                    return {subdivision_id: subdivision_id};
                }
                if (options) {
                    options.subdivision_id = subdivision_id;
                    return {item: kendo.stringify(options)};
                }
            }
        },
        schema: {
            model: {
                id: "department_id",
                fields: { name: {
                    validation: {
                        required: { message: "Поле не может быть пустым" }
                    }
                }, tel: {}, mail: {} }
            }
        },
        requestEnd: function (e) {
//            n.close();
            if ((e.type == "update") || (e.type == "destroy")) {
                $(".reload_author").click();
            }
        }
    });

    var department = detailRow.find("#department").kendoGrid({
        dataSource: department_dataSource,
        height: 350,
        sortable: true,
        editable: {
            mode: "inline",
            confirmation: "Вы уверены, что хотите удалить запись?",
            confirmDelete: "Да",
            cancelDelete: "Нет"
        },
        pageable: {
            pageSize: 20,
            //pageSizes: true,
            messages: {
                display: " ",
                empty: " ",
                previous: "Предыдущая страница",
                next: "Следующая страница",
                last: "Последняя страница",
                first: "Первая страница"
            }
        },
        toolbar: [
            { template: kendo.template($("#department_header_template").html()) }
        ],
        columns: [
            { field: "name", title: "Название" },
            { field: "tel", title: "Телефон", width: "300px" },
            { field: "mail", title: "Электронный адрес", width: "300px" },
            { command: [
                { name: "edit",
                    text: {
                        edit: "Редактировать",
                        update: "Сохранить",
                        cancel: "Отменить"
                    }
                },
                { name: "destroy", text: "Удалить" }
            ], width: "250px", attributes: { style: "text-align: center;"} }
        ],
        save: function (e) {
            var new_name = e.model.name;
            var data = department_dataSource.data();
            var result;
            if (e.model.department_id != "") { ///возможно это редактирование
                result = $.grep(data,
                    function (o) {
                        if (o.department_id != e.model.department_id) {
                            return o.name.toUpperCase() == new_name.toUpperCase();
                        } else { //проверка, есть ли такие подразделения
                            return false;
                        }
                    }
                );
                if (result.length > 0) {
                    noty_error("Такой отдел уже добавлен");
                    e.preventDefault();
                }
            } else { //возможно это добавление, (id == "")
                result = $.grep(data,
                    function (o) {
                        if (o.department_id != "") {
                            return o.name.toUpperCase() == new_name.toUpperCase();
                        } else { //проверка, есть ли такие подразделения
                            return false;
                        }
                    }
                );
                if (result.length > 0) {
                    noty_error("Такой отдел уже добавлен");
                    e.preventDefault();
                }
            }
        }
    }).data("kendoGrid");

    detailRow.find(".add_department").click(function (e) {
        department.addRow();
        return false;
    });

    detailRow.find(".add_reload").click(function (e) {
//        n = noty_message(M_LOAD, false);
        department.dataSource.read();
        department.refresh();
        return false;
    });
}
///////////////////////////////////////  \\ОТДЕЛЫ

///////////////////////////////////////  ФАЙЛЫ
function intellectual_property_detail_init(e) {
    var detailRow = e.detailRow;
    var intellect_prop_id = e.data.intellectual_property_id;

    var files = [];

    $.post(API_BASE_URL + "file/get_list/",
        {item: JSON.stringify({intellectual_property_id: intellect_prop_id})},
        function (data) {
            files = data;
            detailRow.find("#files").kendoUpload({
                multiple: true,
                async: {
                    saveUrl: API_BASE_URL + "file/upload/",
                    removeUrl: API_BASE_URL + "file/delete/",
                    autoUpload: false
                },
                localization: FILE_UPLOAD_LOC,
                template: kendo.template($('#fileTemplate').html()),
                files: files,
                success: function (e) {
                    if (e.operation == "upload") {
                        var that = this;
                        $.post(API_BASE_URL + "file/get_list/",
                            {item: JSON.stringify({intellectual_property_id: intellect_prop_id})},
                            function (data) {
                                that.wrapper.find("ul.k-upload-files.k-reset").remove();
//                                that.wrapper.find("li.k-file.k-file-success").remove();
                                that._renderInitialFiles(data);
                            });
                    }
                },
                select: function (e) {
//                    console.log("suc ",e);
                },
                upload: function (e) {
                    var f = e.files;
                    for (var i = 0; i < f.length; i++) {
                        for (var j = i + 1; j < f.length; j++) {
                            if ((f[i].name == f[j].name) &&
                                (f[i].size == f[j].size) &&
                                (f[i].extension == f[j].extension)) {
                                noty_error("Не загружайте одинаковые файлы!");
                                e.preventDefault();
                                return;
                            }
                        }
                    }
                    e.data = {item: JSON.stringify({intellectual_property_id: intellect_prop_id})};
                },
                remove: function (e) {
                    var files = e.files;
                    e.data = {item: JSON.stringify(files)};
                    if (!confirm("Вы уверены, что хотите удалить " + files[0].name + "?")) {
                        e.preventDefault();
                    }
                }
            });
        }, "json");
}

$(document).ready(function () {
    $("body").on("click", ".file-wrapper", function(e) {
        var $this = $(this);
        if ($this.data("type").toUpperCase() == ".pdf".toUpperCase()) {
            window.open(["/static/pdf.js/web/viewer.html?file=/media/",$this.data("file-url")].join(""),"_blank")
        }
    });
});
///////////////////////////////////////  \\ФАЙЛЫ