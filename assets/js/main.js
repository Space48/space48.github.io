require(["lib/domReady", "lib/mustache", "lib/promise", "lib/json3", "lib/store"], function(domReady, mustache, promise, json, store) {
	'use strict';

	var Helpers = {
		$: function(id) {
			return document.getElementById(id);
		},

		getHtml: function (id) {
			return Helpers.$(id).innerHTML;
		},

		setHtml: function (id, content) {
			Helpers.$(id).innerHTML = content;
		}
	};

	var CacheStorage = function () {

		var get_expiry_date_key = function (key) {
			return key + "-expires";
		}

		var get_data_key = function (key) {
			return key + "-data";
		}

		return {
			'get': function (key) {
				var data = store.get(get_data_key(key));

				if (data !== undefined) {
					var now = new Date().getTime() * 1;
					var expiry = store.get(get_expiry_date_key(key)) * 1;

					if (expiry > now) {
						return data;
					}
				}

				return undefined;
			},

			'set': function (key, value, ttl_seconds) {
				var ttl_seconds = (ttl_seconds == undefined) ? 60 * 60 * 24 * 365: ttl_seconds;

				store.set(get_data_key(key), value);
				store.set(get_expiry_date_key(key), (new Date().getTime()) + ttl_seconds * 1000);
			}
		};
	};

	var Template = function (output_container_el_id) {
		return {
			'render': function (content) {
				Helpers.setHtml(output_container_el_id, content);
			},

			'renderTemplate': function (template_el_id, content_obj) {
				this.render(mustache.render(Helpers.getHtml(template_el_id), content_obj));
			}
		}
	}

	var cache_keys = {
		REPOS: 'repos'
	};

	var cache = new CacheStorage();
	var cache_value = cache.get(cache_keys.REPOS);

	var template = new Template('js-projects');

	if (cache_value == undefined) {
		promise.get('https://api.github.com/orgs/meanbee/repos').then(function (error, text, xhr) {
			if (!error) {
				var content = JSON.parse(text);

				template.renderTemplate('js-template-projects', { 'projects': content });

				cache.set(cache_keys.REPOS, content, 60);
			} else {
				template.render("Oops, there was an error loading our repositories.");
			}
		});
	} else {
		template.renderTemplate('js-template-projects', { 'projects': cache_value });
	}
});
