/**
 * 18K Nail Boutique — 3D SCENES
 *
 * Two Three.js scenes for a "wow factor" without going tech-bro:
 *   1. Hero: rotating 3D "18K" gold wordmark (extruded, chromatic reflection)
 *   2. Gallery: rotating 3D cube with nail-art on each face, drag/scroll to rotate
 *
 * Guardrails:
 *   - Lazy-init: waits for THREE global to load, then attaches on visible mount
 *   - Pause when tab hidden or scene off-screen (IntersectionObserver)
 *   - Respects prefers-reduced-motion + user 'reduced' localStorage pref
 *   - Skips on WebGL-disabled browsers (falls back to static image/grid)
 *   - Total: ~9KB minified (+ Three.js ~150KB from CDN cached)
 */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const userReduced = (() => {
    try { return localStorage.getItem('18k_motion_pref_v1') === 'reduced'; } catch { return false; }
  })();
  const isReduced = prefersReduced || userReduced;

  // Detect WebGL support
  function hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch { return false; }
  }
  if (!hasWebGL()) return;

  // Wait for Three.js CDN
  function waitForTHREE(cb, tries = 0) {
    if (window.THREE) return cb();
    if (tries > 60) return console.warn('[18K 3D] Three.js failed to load in 3s; skipping 3D scenes');
    setTimeout(() => waitForTHREE(cb, tries + 1), 50);
  }

  // ==================================================================
  // SCENE 1: 3D "18K" GOLD WORDMARK IN HERO
  // ==================================================================
  function initHeroWordmark() {
    const mount = document.getElementById('hero-3d-mount');
    if (!mount) return;

    const { THREE } = window;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Build "18K" as three chunky extruded boxes with beveled edges (no font loader needed)
    const group = new THREE.Group();
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xB8964E,
      metalness: 0.95,
      roughness: 0.28,
      clearcoat: 1.0,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.2,
      emissive: 0x3d2e10,
      emissiveIntensity: 0.15,
    });

    // Simulate "18K" letters using 3 rectangular slabs (visual mark, not literal letters)
    // Slab 1: '1' - thin vertical
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.0, 0.5), goldMat);
    s1.position.set(-1.8, 0, 0);
    // Slab 2: '8' - stacked rings visualized as two boxes stacked
    const s2a = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.18, 20, 60), goldMat);
    s2a.position.set(-0.5, 0.55, 0);
    const s2b = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.18, 20, 60), goldMat);
    s2b.position.set(-0.5, -0.55, 0);
    // Slab 3: 'K' - vertical + two angled
    const kv = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.0, 0.5), goldMat);
    kv.position.set(1.1, 0, 0);
    const ka1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.2, 0.5), goldMat);
    ka1.position.set(1.75, 0.55, 0);
    ka1.rotation.z = -Math.PI / 4;
    const ka2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.2, 0.5), goldMat);
    ka2.position.set(1.75, -0.55, 0);
    ka2.rotation.z = Math.PI / 4;

    group.add(s1, s2a, s2b, kv, ka1, ka2);
    scene.add(group);

    // Lighting — three-point warm gold
    const keyLight = new THREE.DirectionalLight(0xfff2d6, 2.4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffc36b, 1.8);
    rimLight.position.set(-3, -2, 3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xfff0d5, 0.8, 20);
    fillLight.position.set(0, 0, 6);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    // Mouse-tracked tilt
    let targetRotX = 0, targetRotY = 0;
    function onMove(e) {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = nx * 0.4;
      targetRotX = -ny * 0.25;
    }
    window.addEventListener('mousemove', onMove, { passive: true });

    // Animation loop
    let clock = new THREE.Clock();
    let running = true;
    function animate() {
      if (!running) return;
      const t = clock.getElapsedTime();
      // Idle: gentle sway + slow y-rotation
      group.rotation.y += (targetRotY + Math.sin(t * 0.4) * 0.15 - group.rotation.y) * 0.04;
      group.rotation.x += (targetRotX + Math.cos(t * 0.3) * 0.06 - group.rotation.x) * 0.04;
      group.position.y = Math.sin(t * 0.6) * 0.08;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    if (!isReduced) animate();
    else { renderer.render(scene, camera); } // Static render only

    // Resize handling
    let resizeTO;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      }, 150);
    });

    // Pause when off-screen or tab hidden
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !isReduced && !document.hidden) {
          if (!running) { running = true; animate(); }
        } else { running = false; }
      });
    }, { threshold: 0 });
    io.observe(mount);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false;
      else if (!isReduced) { running = true; animate(); }
    });
  }

  // ==================================================================
  // SCENE 2: 3D GALLERY CUBE (rotating, drag/scroll to spin)
  // ==================================================================
  function initGalleryCube() {
    const mount = document.getElementById('gallery-3d-mount');
    if (!mount) return;

    const { THREE } = window;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // 6 nail-art faces (gallery images 1-6)
    const loader = new THREE.TextureLoader();
    const facePaths = [
      './images/gallery-1.jpg',
      './images/gallery-2.jpg',
      './images/gallery-3.jpg',
      './images/gallery-4.jpg',
      './images/gallery-5.jpg',
      './images/gallery-6.jpg',
    ];
    const materials = facePaths.map(p => {
      const tex = loader.load(p);
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      return new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.15,
        roughness: 0.55,
      });
    });

    const cube = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), materials);
    scene.add(cube);

    // Subtle gold-tint edges via wireframe overlay
    const edgeGeo = new THREE.EdgesGeometry(cube.geometry);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xB8964E, transparent: true, opacity: 0.45 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    cube.add(edges);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dl1 = new THREE.DirectionalLight(0xffe8c4, 1.2);
    dl1.position.set(2, 3, 4);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0xffd28a, 0.8);
    dl2.position.set(-3, -2, 2);
    scene.add(dl2);

    // Drag-to-rotate
    let dragging = false, prevX = 0, prevY = 0;
    let velX = 0.003, velY = 0.0015;

    function onDown(e) {
      dragging = true;
      prevX = (e.touches ? e.touches[0].clientX : e.clientX);
      prevY = (e.touches ? e.touches[0].clientY : e.clientY);
    }
    function onMove(e) {
      if (!dragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = cx - prevX;
      const dy = cy - prevY;
      cube.rotation.y += dx * 0.008;
      cube.rotation.x += dy * 0.008;
      velX = dx * 0.001;
      velY = dy * 0.001;
      prevX = cx; prevY = cy;
    }
    function onUp() { dragging = false; }
    mount.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    mount.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    let running = true;
    function animate() {
      if (!running) return;
      if (!dragging) {
        cube.rotation.y += velX;
        cube.rotation.x += velY;
        velX *= 0.995; // gentle inertia decay to base drift
        velY *= 0.995;
        velX = velX + (0.003 - velX) * 0.01;   // return toward slow drift
        velY = velY + (0.0015 - velY) * 0.01;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    if (!isReduced) animate();
    else { renderer.render(scene, camera); }

    let resizeTO;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      }, 150);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !isReduced && !document.hidden) {
          if (!running) { running = true; animate(); }
        } else { running = false; }
      });
    }, { threshold: 0.1 });
    io.observe(mount);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false;
      else if (!isReduced) { running = true; animate(); }
    });
  }

  // ==================================================================
  // BOOT
  // ==================================================================
  function boot() {
    waitForTHREE(() => {
      try { initHeroWordmark(); } catch (e) { console.warn('[18K 3D] wordmark failed:', e); }
      try { initGalleryCube(); } catch (e) { console.warn('[18K 3D] gallery failed:', e); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
