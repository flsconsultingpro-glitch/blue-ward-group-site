(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const mobilePanel = document.getElementById("navMobilePanel");

  function setNavOpen(open) {
    if (!nav) return;
    nav.classList.toggle("open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (mobilePanel) {
      mobilePanel.setAttribute("aria-hidden", open ? "false" : "true");
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (nav) {
    window.addEventListener(
      "scroll",
      function () {
        nav.classList.toggle("scrolled", window.scrollY > 60);
      },
      { passive: true }
    );
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setNavOpen(!nav.classList.contains("open"));
    });
  }

  document.querySelectorAll('.nav-mobile-panel a, .nav-cta, .nav-links a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      setNavOpen(false);
    });
  });

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = (parseInt(entry.target.dataset.delay, 10) || 0) * 120;
        setTimeout(function () {
          entry.target.classList.add("visible");
        }, delay);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal, .section-divider").forEach(function (el) {
    revealObserver.observe(el);
  });

  function runCountUp(el) {
    if (el.hasAttribute("data-static")) return;
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || "";
    if (Number.isNaN(target)) return;
    if (target === 0) {
      el.textContent = "0" + suffix;
      return;
    }
    var duration = 1400;
    var start = performance.now();
    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = Math.floor(target * eased);
      el.textContent = value.toLocaleString("fr-FR") + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCountUp(entry.target);
        statObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll(".stat-number[data-target]").forEach(function (el) {
    statObserver.observe(el);
  });

  var interventionPoints = [
    { city: "Paris", country: "France", lat: 48.85, lng: 2.35 },
    { city: "Londres", country: "Royaume-Uni", lat: 51.5, lng: -0.12 },
    { city: "Genève", country: "Suisse", lat: 46.2, lng: 6.14 },
    { city: "Monaco", country: "Monaco", lat: 43.73, lng: 7.42 },
    { city: "Bruxelles", country: "Belgique", lat: 50.85, lng: 4.35 },
    { city: "Madrid", country: "Espagne", lat: 40.41, lng: -3.7 },
    { city: "Rome", country: "Italie", lat: 41.9, lng: 12.49 },
    { city: "Dubaï", country: "Émirats Arabes Unis", lat: 25.2, lng: 55.27 },
    { city: "Riyad", country: "Arabie Saoudite", lat: 24.71, lng: 46.67 },
    { city: "Doha", country: "Qatar", lat: 25.28, lng: 51.53 },
    { city: "Abu Dhabi", country: "Émirats Arabes Unis", lat: 24.45, lng: 54.37 },
    { city: "Abidjan", country: "Côte d'Ivoire", lat: 5.36, lng: -4.0 },
    { city: "Dakar", country: "Sénégal", lat: 14.69, lng: -17.44 },
    { city: "Casablanca", country: "Maroc", lat: 33.57, lng: -7.58 },
    { city: "Nairobi", country: "Kenya", lat: -1.29, lng: 36.82 },
    { city: "New York", country: "États-Unis", lat: 40.71, lng: -74.0 },
    { city: "Washington", country: "États-Unis", lat: 38.9, lng: -77.03 },
    { city: "Tokyo", country: "Japon", lat: 35.67, lng: 139.65 },
    { city: "Singapour", country: "Singapour", lat: 1.35, lng: 103.81 },
    { city: "Hong Kong", country: "Hong Kong", lat: 22.32, lng: 114.17 }
  ];

  async function initWorldMap() {
    var mapEl = document.getElementById("world-map");
    var tooltip = document.getElementById("map-tooltip");
    if (!mapEl || typeof d3 === "undefined" || typeof topojson === "undefined") return;

    var width = mapEl.clientWidth || 1200;
    var height = 500;

    var projection = d3
      .geoNaturalEarth1()
      .scale(width / 5.8)
      .center([20, 10])
      .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    var svg = d3
      .select(mapEl)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("role", "presentation")
      .style("cursor", "default");

    svg.on("wheel.zoom", null);
    svg.on("mousedown.zoom", null);
    svg.on("touchstart.zoom", null);
    svg.on("dblclick.zoom", null);

    var g = svg.append("g");

    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#03002b")
      .style("pointer-events", "none");

    var world;
    try {
      world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    } catch (e) {
      mapEl.innerHTML =
        '<p style="color:#575773;padding:2rem;text-align:center;">Carte indisponible (vérifiez la connexion).</p>';
      return;
    }

    var countries = topojson.feature(world, world.objects.countries);

    g.selectAll("path.country")
      .data(countries.features)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", "rgba(255,255,255,0.04)")
      .style("stroke", "rgba(255,255,255,0.08)")
      .style("stroke-width", "0.5px");

    if (!tooltip) return;

    interventionPoints.forEach(function (pt) {
      var coords = projection([pt.lng, pt.lat]);
      if (!coords || !isFinite(coords[0])) return;
      var x = coords[0];
      var y = coords[1];

      var gPoint = g.append("g").attr("transform", "translate(" + x + "," + y + ")");

      gPoint.append("circle").attr("r", 3.5).style("fill", "rgba(255,255,255,0.85)");

      gPoint.style("cursor", "default");

      gPoint
        .on("mouseenter", function () {
          var cityEl = tooltip.querySelector(".tt-city");
          var countryEl = tooltip.querySelector(".tt-country");
          if (cityEl) cityEl.textContent = pt.city;
          if (countryEl) countryEl.textContent = pt.country;
          tooltip.classList.add("visible");
          tooltip.setAttribute("aria-hidden", "false");
        })
        .on("mousemove", function (event) {
          var wrapper = document.querySelector(".map-wrapper");
          if (!wrapper) return;
          var rect = wrapper.getBoundingClientRect();
          var tx = event.clientX - rect.left + 12;
          var ty = event.clientY - rect.top - 10;
          if (tx + 180 > wrapper.clientWidth) tx = event.clientX - rect.left - 180;
          if (tx < 8) tx = 8;
          if (ty < 8) ty = 8;
          tooltip.style.left = tx + "px";
          tooltip.style.top = ty + "px";
        })
        .on("mouseleave", function () {
          tooltip.classList.remove("visible");
          tooltip.setAttribute("aria-hidden", "true");
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorldMap);
  } else {
    initWorldMap();
  }

  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }
})();
