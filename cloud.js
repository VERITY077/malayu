/* 云同步：Supabase 邮箱登录 + 进度读写
 * 未配置时所有方法安全降级，不影响本机模式。
 */
window.Cloud = (function () {
  var cfg = window.SUPABASE_CONFIG || {};
  var client = null;
  var user = null;
  var loading = false;
  var loaded = false;
  var listeners = [];

  function configured() {
    return !!(cfg.url && cfg.anonKey);
  }

  function loadScript(cb) {
    if (window.supabase && window.supabase.createClient) return cb(null);
    if (loading) { setTimeout(function () { loadScript(cb); }, 120); return; }
    loading = true;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = function () { cb(null); };
    s.onerror = function () { cb(new Error('supabase sdk 加载失败')); };
    document.head.appendChild(s);
  }

  function notify() {
    listeners.forEach(function (f) { try { f(user); } catch (e) {} });
  }

  function init(cb) {
    if (!configured()) { loaded = true; cb(null); return; }
    loadScript(function (err) {
      if (err) { loaded = true; cb(null); return; }
      client = window.supabase.createClient(cfg.url, cfg.anonKey);
      client.auth.getSession().then(function (res) {
        user = res && res.data && res.data.session ? res.data.session.user : null;
        loaded = true;
        cb(user);
      }).catch(function () {
        loaded = true;
        cb(null);
      });
      client.auth.onAuthStateChange(function (event, session) {
        user = session ? session.user : null;
        notify();
      });
    });
  }

  function onChange(f) { listeners.push(f); }
  function currentUser() { return user; }
  function isLoaded() { return loaded; }

  function signIn(email) {
    if (!client) return Promise.reject(new Error('未配置云端'));
    return client.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: location.origin + location.pathname }
    });
  }
  function verifyOtp(email, token) {
    if (!client) return Promise.reject(new Error('未配置云端'));
    return client.auth.verifyOtp({ email: email, token: token, type: 'email' });
  }
  function signOut() {
    if (!client) return Promise.resolve();
    return client.auth.signOut();
  }

  function fetchState() {
    if (!client || !user) return Promise.resolve(null);
    return client.from('progress')
      .select('state,updated_at')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(function (r) { return r && r.data ? r.data : null; });
  }

  function pushState(state) {
    if (!client || !user) return Promise.resolve();
    return client.from('progress').upsert({
      user_id: user.id,
      state: state,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  }

  return {
    configured: configured,
    init: init,
    onChange: onChange,
    currentUser: currentUser,
    isLoaded: isLoaded,
    signIn: signIn,
    verifyOtp: verifyOtp,
    signOut: signOut,
    fetchState: fetchState,
    pushState: pushState
  };
})();
