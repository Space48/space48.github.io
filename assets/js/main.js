require(["lib/domReady", "lib/mustache", "lib/promise", "lib/json3"], function(domReady, mustache, promise, json) {
	'use strict';

	var $ = function (id) {
		return document.getElementById(id);
	}

	var container_el = $('js-projects');
	var template_el = $('js-template-projects');

	var template = template_el.innerHTML;

	promise.get('https://api.github.com/orgs/meanbee/repos').then(function (error, text, xhr) {

		var rendered_template;

		if (!error) {
			var response = json.parse(text);
			rendered_template = mustache.render(template, {
				'projects': response
			});

		} else {
			rendered_template = "Oops, there was an error loading our repositories.";
		}

		container_el.innerHTML = rendered_template;
	});
});
