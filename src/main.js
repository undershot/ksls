;(function ($, window) {


	console.log($);

	const Config = {
		currentItem: null,
		selected: null,
		initialValues: {
			rotate: 0,
			scale: 1
		},
		accessories: {
			glasses: null,
			beards: null,
			hats: null
		}
	};

	const Fields = {
		dropzone: $("#dropzone"),
		photo: $("#imageFace"),
		selectable: $(".selectable"),
		picture: $("#picture"),
		plus: $("#plus"),
		minus: $("#minus"),
		left: $("#left"),
		right: $("#right"),
		draggableItems: $(".accessories"),
		canvas: $("#canvas")
	};

	const Pos = {
		picture: Fields.picture.offset(),
		pictureWidth: Fields.picture.width(),
		pictureHeight: Fields.picture.height(),
	};


	const DropzoneField = function ({element, photo}) {
		this.element = element;
		this.photoEl = photo;

		this._maxFileSize = 300 * 1024;

		this._reader = new FileReader();

		this.onReaderLoaded = (e) => {
			// alert("Изображение успешно загружено");

			this.photoEl.css({
				backgroundImage: `url(${e.target.result})`
			});

			ImageFaceField.setSelected(this.photoEl);

			return false;
		};

		this.setLoadedFile = () => {

		};

		this.readFile = (file) => {
			return this._reader.readAsDataURL(file);
		};

		this.init = () => {

			console.log("init");

			// alert("Загрузите фото");

			if (typeof window.FileReader === "undefined") {
				console.error("FileReader is not defined");

				return false;
			}

			this._reader.onload = this.onReaderLoaded;

			this.element.on('dragenter dragleave drop dragover', function (e) {
				e.preventDefault();
				e.stopPropagation();
			});

			this.element.on("dragenter", (e) => {
				// console.log("DRAG: ENTER");

				e.originalEvent.dataTransfer.dropEffect = "copy";
			});

			this.element.on("dragleave", (e) => {
				// console.log("DROPPED");

				return false;
			});

			this.element.on("dragover", (e) => {
				e.originalEvent.dataTransfer.dropEffect = "copy";
			});

			this.element.on("drop", (e) => {
				e.preventDefault();

				let files = e.originalEvent.dataTransfer.files;

				if (files.length > 1) {
					alert("Ошибка\n\nВы можете загрузить только один файл");

					return false;
				}

				if (files[0].size > this._maxFileSize) {
					alert("Ошибка\n\nРазмер файла превышает 300kb");

					return false;
				}

				this.readFile(files[0]);

				console.log("DRAG: DROP", files);

				return false;
			});

		};
	};


	const ImageFaceField = function ({photo, selectable, picture}) {
		this.photoEl = photo;
		this.selectable = selectable;
		this.picture = picture;

		this.selected = null;

		this.init = () => {
			console.log("ImageFace init");

			let self = this;

			$("body").on("click", ".selectable", function () {

				ImageFaceField.setSelected(this);

			});


		}
	};

	ImageFaceField.setSelected = function (item) {
		if (Config.selected) $(Config.selected).removeClass("selected");

		$(item).addClass("selected");

		Config.selected = item;
	};

	const DraggableFields = function () {


		this.init = () => {

			Fields.draggableItems.draggable({
				// containment: "parent"
				// helper: "clone"
				scroll: true,
				// stack: Fields.picture,
				stop: (e, ui) => {
					let o = ui.offset;
					let p = Pos.picture;

					let t = e.target;

					let cat = t.classList[0];
					let cur = Config.accessories[cat];


					if (
						o.top >= p.top - 50 &&
						o.left >= p.left - 50 &&
						o.left <= Pos.pictureWidth + p.left - 50 &&
						o.top <= Pos.pictureHeight + p.top + 50
					) {
						console.log("INSIDE", cat, Config.accessories[cat]);

						// new
						if (!cur) {
							$(t).addClass("selectable");

							Config.accessories[cat] = t;

							ImageFaceField.setSelected(t);

							console.log("ADDED", cat, cur, t.id)
						} else if (cur.id !== t.id) {
							console.log("HAS", cat, cur.id, t.id)

							t.style.top = 0;
							t.style.left = 0;
							t.style.transform = "none";
						}
					} else {
						console.log("OUTSIDE", cat, "cur:", cur);

						if (cur && cur.id === t.id) {

							Config.selected = null;
							Config.accessories[cat] = null;

							if ($(t).hasClass("selectable")) {
								$(t).removeClass("selectable");

								if ($(t).hasClass("selected")) {
									$(t).removeClass("selected");
								}
							}

							console.log("DELETE", cat, cur);
							console.log("__________");


						}

						t.style.top = 0;
						t.style.left = 0;
						t.style.transform = "none";

					}


					// console.log(ui.offset, Pos.picture)

				},
				// snap: Fields.picture
			});

		}
	};

	const Editor = function () {
		this.values = Object.assign({}, Config.initialValues);

		this.setMatrix = (props) => {
			Object.assign(this.values, props);

			this.updateStyles();
		};

		this.updateStyles = () => {
			let a = this.values;
			let res = "";

			Object.keys(a).map((value, index) => {
				// console.log(value, index);
				res += `${value}(${a[value]}) `;
			});

			$(Config.selected).css({transform: res})
		};

		this.onPlusClick = (e) => {

			this.setMatrix({
				scale: this.values.scale + 0.2
			});

			// $(Config.selected).css({transform: "matrix(2, 0, 0, 2, 0, 0)"})
		};

		this.onMinusClick = (e) => {
			this.setMatrix({
				scale: this.values.scale - 0.2
			});
		};

		this.onLeftClick = (e) => {
			this.getStyle($(Config.selected));

			this.setMatrix({
				rotate: this.values.scale + 0.2
			});
		};

		this.onRightClick = (e) => {

		};

		this.getStyle = (item) => {
			console.log(item.css("transform"))
		};

		this.init = () => {
			Fields.plus.on("click", this.onPlusClick);
			Fields.minus.on("click", this.onMinusClick);
			Fields.left.on("click", this.onLeftClick);
			Fields.right.on("click", this.onRightClick);
		};

	};


	const CanvasWorker = function () {

		this.ctx = Fields.canvas[0].getContext("2d");








		// SSSSSSSSSSS



		const getStyles = () => {
			return new Promise((res, rej) => {

				let list = [
					"top", "left", "right", "bottom",
					"background", "width", "height", "transform",
					"position"
				];
				let result = [];

				let el = Fields.picture;

				let styles = null;
				let f = {};

				let ch = [Config.accessories.hats, Config.accessories.beards, Config.accessories.glasses];

				// console.log(ch)

				ch.map((value, index) => {

					if(!value) return;

					let clonned = $(value).clone();

					// console.log(t.offsetLeft)

					clonned.css({
						position: "absolute",
						top: value.offsetTop - el[0].offsetTop + 10,
						left: value.offsetLeft - el[0].offsetLeft + 10
					});

					el.append( clonned );
				});

				let childrens = el.children();

				childrens.each((index, val) => {

					f = {};

					styles = window.getComputedStyle(val);

					list.map((value, index) => {
						if (styles[value]) {
							f[value] = styles[value]
						}
					});

					result.push(f);
				});

				res(result);
			});
		};

		const generateInlineStyles = (styles) => {
			return new Promise((res, rej) => {
				let el = Fields.picture;

				let childrens = el.children();

				childrens.each((index, value) => {
					$(value).css( styles[index] );
				});

				res( el.html().replace(/&quot;/g, "") );
				el.children(".accessories").remove();
			});
		};

		const getAllUrls = (html) => {

			// console.log("HTML", html);

			return new Promise((res, rej) => {

				let i = /url\((.+?)\)/g;

				let matches = html.match(i);

				let mLength = matches.length;

				let current = 0;

				let result = [];

				// console.log(matches[0].replace(i, "$1"))
				// console.log(this.withBg)

				let resHtml = html;

				const a = () => {
					let img = matches[current].replace(i, "$1");

					// console.log(this.withBg[current].offsetWidth)

					imageUrlToBase64(img).then(r => {
						result.push(r);

						resHtml = resHtml.replace(img, r);

						if( current === mLength - 1 ) {
							res(resHtml);
						} else {
							current++;
							a();
						}
					});
				};

				a();



			});


		};

		const imageUrlToBase64 = (url) => {
			return new Promise((res, rej) => {
				let canvas = document.createElement("canvas");
				let img = new Image();
				let ctx = canvas.getContext("2d");

				let d = null;

				img.src = url;

				img.onload = () => {
					canvas.width = img.naturalWidth;
					canvas.height = img.naturalHeight;

					ctx.drawImage(img, 0, 0);

					d = canvas.toDataURL();

					res(d);

					canvas = null;
				}
			});
		};

		const renderTemplate = (html = "") => {

			// let _styles = $("#top_styles").html();

			let out = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="600">
				    <foreignObject width="100%" height="100%">
				        <body xmlns="http://www.w3.org/1999/xhtml">				         
				          ${html}
				        </body>
				    </foreignObject>
				</svg>`;

			return out;
		};


		const generateOutput = (data) => {
			return new Promise((res, rej) => {
				let url = "data:image/svg+xml;base64," + btoa(renderTemplate(data));

				let img = new Image;

				img.onload = () => {
					Fields.canvas[0].width = img.naturalWidth;
					Fields.canvas[0].height = img.naturalHeight;

					this.ctx.drawImage(img, 0, 0);

					let d = Fields.canvas[0].toDataURL();

					res(d);
				};

				img.src = url
			});
		};

		const generateImage = () => {


			// Get All styles
			return getStyles().then(r => {

				console.log(r);

				// Generate Inline styles
				return generateInlineStyles(r);

			}).then( (r) => {

				console.log(r);

				return getAllUrls(r);

			}).then( r => {

				// Fields.picture.html(r);

				return generateOutput(r);

			}).then( r => {
				$("#asd").attr("src", r);
			});



		};






		// SSSSSSSSSSS






		this.generateImage = (data) => {

			return generateImage();

		};

		this.init = () => {

		}
	};


	$(window).on("load", () => {
		let dropzone = new DropzoneField({
			element: Fields.dropzone,
			photo: Fields.photo
		});

		let imageFace = new ImageFaceField({
			photo: Fields.photo,
			selectable: Fields.selectable,
			picture: Fields.picture
		});

		let editor = new Editor();

		let draggables = new DraggableFields();
		let canvas = new CanvasWorker();

		dropzone.init();
		imageFace.init();
		editor.init();
		draggables.init();


		$("#save").on("click", () => {
			canvas.generateImage();
		});

	});


	// DroppableField($);


})(window.jQuery, window);