;(function () {
  var w = window,
    C = '___grecaptcha_cfg',
    cfg = (w[C] = w[C] || {}),
    N = 'grecaptcha'
  var gr = (w[N] = w[N] || {})
  gr.ready =
    gr.ready ||
    function (f) {
      ;(cfg['fns'] = cfg['fns'] || []).push(f)
    }
  w['__recaptcha_api'] = 'https://www.google.com/recaptcha/api2/'
  ;(cfg['render'] = cfg['render'] || []).push('explicit')
  ;(cfg['action'] = cfg['action'] || []).push('faucet')
  w['__google_recaptcha_client'] = true
})()
