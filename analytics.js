/* Privacy-first PostHog analytics shared by the Swedish and English pages. */
(function (document, posthog) {
  if ((window.posthog && window.posthog.__loaded) || posthog.__SV) return;

  window.posthog = posthog;
  posthog._i = [];
  posthog.init = function (token, config, name) {
    function stub(target, method) {
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments)));
      };
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.src =
      config.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";

    var firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    var instance = posthog;
    if (name !== undefined) instance = posthog[name] = [];
    else name = "posthog";

    instance.people = instance.people || [];
    stub(instance, "capture");
    posthog._i.push([token, config, name]);
  };
  posthog.__SV = 1;
})(document, window.posthog || []);

function cleanAnalyticsUrl(value) {
  if (typeof value !== "string") return value;
  try {
    var url = new URL(value, window.location.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch (_error) {
    return value;
  }
}

function analyticsBeforeSend(event) {
  if (!event) return null;
  var properties = Object.assign({}, event.properties);
  ["$current_url", "$referrer", "$initial_referrer"].forEach(function (key) {
    properties[key] = cleanAnalyticsUrl(properties[key]);
  });
  return Object.assign({}, event, { properties: properties });
}

window.posthog.init("phc_t7ZizrDCtdiMwGyN5iU7x78ZHa7FoQGcQ6yEgD7UyPqv", {
  api_host: "https://eu.i.posthog.com",
  defaults: "2026-05-30",
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  capture_heatmaps: false,
  capture_dead_clicks: false,
  capture_exceptions: false,
  disable_session_recording: true,
  cookieless_mode: "always",
  person_profiles: "never",
  respect_dnt: true,
  before_send: analyticsBeforeSend,
  loaded: function (posthog) {
    var language = document.documentElement.lang || "sv";
    var pathname = window.location.pathname;

    posthog.capture("$pageview", {
      $current_url: window.location.origin + pathname,
      $pathname: pathname,
      surface: "marketing",
      language: language,
    });

    document.querySelectorAll('a[href^="https://app.liked.app"]').forEach(function (link) {
      link.addEventListener("click", function () {
        var destination = new URL(link.href).pathname;
        posthog.capture("marketing_cta_clicked", {
          destination: destination,
          surface: "marketing",
          language: language,
        });
      });
    });
  },
});
