ï»¿/**
 * MAYHEM FINANCIAL ANALYTICS - COMPREHENSIVE MOCK DATASET
 * ChÃ¡Â»Â©a dÃ¡Â»Â¯ liÃ¡Â»â€¡u thÃ¡Â»Â±c tÃ¡ÂºÂ¿ BCTC vÃƒÂ  thÃƒÂ´ng sÃ¡Â»â€˜ 24 ngÃƒÂ¢n hÃƒÂ ng thÃ†Â°Ã†Â¡ng mÃ¡ÂºÂ¡i ViÃ¡Â»â€¡t Nam.
 */

const MOCK_BANKS = [
  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: NGÃƒâ€š N HÃƒâ‚¬NG Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'BAB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP BÃ¡ÂºÂ¯c ÃƒÂ', exchange: 'HNX', industry: 'ngan-hang',
    cir: 44.99, cpkh_toi: 6.2, blvh: 55.01, blntt: 38.64, blnst: 30.91, ttlr: 20.12,
    roa: 0.85, debt_equity: 8.4, roe: 11.84, cfo: 1420, casa: 12.4, npl: 0.77, nim: 2.85, car: 9.8, llr: 165.2
  },
  {
    ticker: 'ACB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP ÃƒÂ ChÃƒÂ¢u', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 32.8, cpkh_toi: 4.8, blvh: 67.2, blntt: 52.4, blnst: 41.9, ttlr: 18.5,
    roa: 2.42, debt_equity: 7.2, roe: 24.8, cfo: 4850, casa: 26.8, npl: 0.78, nim: 4.12, car: 12.8, llr: 215.0
  },
  {
    ticker: 'ABB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP An BÃƒÂ¬nh', exchange: 'UPCoM', industry: 'ngan-hang',
    cir: 38.4, cpkh_toi: 5.6, blvh: 61.6, blntt: 44.2, blnst: 35.3, ttlr: 16.2,
    roa: 1.25, debt_equity: 8.9, roe: 14.6, cfo: 980, casa: 18.2, npl: 1.65, nim: 3.25, car: 11.2, llr: 128.4
  },
  {
    ticker: 'VCB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP NgoÃ¡ÂºÂ¡i thÃ†Â°Ã†Â¡ng ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 30.2, cpkh_toi: 3.9, blvh: 69.8, blntt: 56.8, blnst: 45.4, ttlr: 22.4,
    roa: 2.18, debt_equity: 6.8, roe: 22.5, cfo: 8900, casa: 34.2, npl: 0.64, nim: 3.68, car: 13.5, llr: 420.0
  },
  {
    ticker: 'MBB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP QuÃƒÂ¢n Ã„ÂÃ¡Â»â„¢i', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 31.5, cpkh_toi: 4.2, blvh: 68.5, blntt: 54.1, blnst: 43.2, ttlr: 24.6,
    roa: 2.35, debt_equity: 7.5, roe: 23.9, cfo: 6200, casa: 40.5, npl: 0.99, nim: 5.12, car: 11.8, llr: 268.0
  },
  {
    ticker: 'TCB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP KÃ¡Â»Â¹ ThÃ†Â°Ã†Â¡ng', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 29.8, cpkh_toi: 3.8, blvh: 70.2, blntt: 58.2, blnst: 46.5, ttlr: 21.8,
    roa: 3.20, debt_equity: 5.9, roe: 21.8, cfo: 7500, casa: 48.2, npl: 0.66, nim: 5.45, car: 15.2, llr: 185.0
  },
  {
    ticker: 'CTG', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP CÃƒÂ´ng ThÃ†Â°Ã†Â¡ng ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 34.2, cpkh_toi: 5.1, blvh: 65.8, blntt: 48.5, blnst: 38.8, ttlr: 15.6,
    roa: 1.45, debt_equity: 9.1, roe: 17.8, cfo: 5100, casa: 22.4, npl: 1.26, nim: 3.10, car: 10.8, llr: 178.0
  },
  {
    ticker: 'BID', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP Ã„ÂÃ¡ÂºÂ§u tÃ†Â° vÃƒÂ  PhÃƒÂ¡t triÃ¡Â»Æ’n', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 35.8, cpkh_toi: 5.4, blvh: 64.2, blntt: 46.2, blnst: 36.9, ttlr: 17.2,
    roa: 1.15, debt_equity: 9.8, roe: 16.5, cfo: 4600, casa: 21.5, npl: 1.18, nim: 2.95, car: 10.4, llr: 195.0
  },
  {
    ticker: 'VPB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP ViÃ¡Â»â€¡t Nam ThÃ¡Â»â€¹nh VÃ†Â°Ã¡Â»Â£ng', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 24.5, cpkh_toi: 3.5, blvh: 75.5, blntt: 49.8, blnst: 39.8, ttlr: 28.5,
    roa: 2.85, debt_equity: 6.2, roe: 22.1, cfo: 6800, casa: 23.4, npl: 3.25, nim: 7.85, car: 14.8, llr: 85.0
  },
  {
    ticker: 'BVB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP BÃ¡ÂºÂ£n ViÃ¡Â»â€¡t', exchange: 'UPCoM', industry: 'ngan-hang',
    cir: 46.8, cpkh_toi: 6.8, blvh: 53.2, blntt: 36.5, blnst: 29.2, ttlr: 14.5,
    roa: 0.92, debt_equity: 8.7, roe: 12.4, cfo: 750, casa: 14.5, npl: 1.85, nim: 2.75, car: 9.5, llr: 110.0
  },
  {
    ticker: 'EIB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP XuÃ¡ÂºÂ¥t NhÃ¡ÂºÂ­p khÃ¡ÂºÂ©u ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 42.1, cpkh_toi: 5.9, blvh: 57.9, blntt: 41.2, blnst: 32.9, ttlr: 19.8,
    roa: 1.35, debt_equity: 7.9, roe: 15.2, cfo: 1850, casa: 17.6, npl: 1.42, nim: 2.65, car: 11.5, llr: 135.0
  },
  {
    ticker: 'HDB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP PhÃƒÂ¡t triÃ¡Â»Æ’n TP.HCM', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 33.5, cpkh_toi: 4.5, blvh: 66.5, blntt: 51.2, blnst: 40.9, ttlr: 23.8,
    roa: 2.15, debt_equity: 7.1, roe: 23.4, cfo: 4100, casa: 20.8, npl: 1.35, nim: 4.85, car: 12.2, llr: 168.0
  },
  {
    ticker: 'KLB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP KiÃƒÂªn Long', exchange: 'UPCoM', industry: 'ngan-hang',
    cir: 45.2, cpkh_toi: 6.4, blvh: 54.8, blntt: 37.8, blnst: 30.2, ttlr: 12.5,
    roa: 0.88, debt_equity: 9.2, roe: 11.5, cfo: 620, casa: 11.8, npl: 1.95, nim: 2.80, car: 9.6, llr: 105.0
  },
  {
    ticker: 'LPB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP BÃ†Â°u Ã„â€˜iÃ¡Â»â€¡n LiÃƒÂªn ViÃ¡Â»â€¡t', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 36.5, cpkh_toi: 5.2, blvh: 63.5, blntt: 47.5, blnst: 38.0, ttlr: 26.2,
    roa: 1.85, debt_equity: 7.8, roe: 21.2, cfo: 3400, casa: 19.5, npl: 1.12, nim: 3.45, car: 11.9, llr: 155.0
  },
  {
    ticker: 'MSB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP HÃƒÂ ng HÃ¡ÂºÂ£i ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 35.2, cpkh_toi: 4.9, blvh: 64.8, blntt: 48.2, blnst: 38.5, ttlr: 19.5,
    roa: 1.95, debt_equity: 7.4, roe: 19.8, cfo: 3200, casa: 32.5, npl: 1.38, nim: 4.25, car: 12.5, llr: 148.0
  },
  {
    ticker: 'NAB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP Nam ÃƒÂ', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 41.5, cpkh_toi: 5.8, blvh: 58.5, blntt: 43.5, blnst: 34.8, ttlr: 22.0,
    roa: 1.48, debt_equity: 8.1, roe: 18.5, cfo: 1950, casa: 16.2, npl: 1.48, nim: 3.35, car: 11.0, llr: 140.0
  },
  {
    ticker: 'NVB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP QuÃ¡Â»â€˜c DÃƒÂ¢n', exchange: 'HNX', industry: 'ngan-hang',
    cir: 52.5, cpkh_toi: 7.5, blvh: 47.5, blntt: 28.5, blnst: 22.8, ttlr: 8.5,
    roa: 0.45, debt_equity: 11.5, roe: 6.8, cfo: 310, casa: 9.5, npl: 2.85, nim: 2.15, car: 8.5, llr: 75.0
  },
  {
    ticker: 'OCB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP PhÃ†Â°Ã†Â¡ng Ã„ÂÃƒÂ´ng', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 34.8, cpkh_toi: 4.7, blvh: 65.2, blntt: 49.5, blnst: 39.6, ttlr: 20.5,
    roa: 2.05, debt_equity: 7.0, roe: 20.5, cfo: 3600, casa: 18.8, npl: 1.25, nim: 3.95, car: 12.8, llr: 162.0
  },
  {
    ticker: 'PGB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP ThÃ¡Â»â€¹nh vÃ†Â°Ã¡Â»Â£ng vÃƒÂ  PhÃƒÂ¡t triÃ¡Â»Æ’n', exchange: 'UPCoM', industry: 'ngan-hang',
    cir: 48.5, cpkh_toi: 6.9, blvh: 51.5, blntt: 34.2, blnst: 27.3, ttlr: 11.2,
    roa: 0.78, debt_equity: 8.8, roe: 10.2, cfo: 520, casa: 13.5, npl: 2.15, nim: 2.65, car: 9.8, llr: 98.0
  },
  {
    ticker: 'SGB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP SÃƒÂ i GÃƒÂ²n CÃƒÂ´ng ThÃ†Â°Ã†Â¡ng', exchange: 'UPCoM', industry: 'ngan-hang',
    cir: 49.2, cpkh_toi: 7.1, blvh: 50.8, blntt: 33.5, blnst: 26.8, ttlr: 10.5,
    roa: 0.72, debt_equity: 8.5, roe: 9.8, cfo: 480, casa: 12.8, npl: 2.25, nim: 2.55, car: 10.2, llr: 92.0
  },
  {
    ticker: 'SHB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP SÃƒÂ i GÃƒÂ²n - HÃƒÂ  NÃ¡Â»â„¢i', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 36.8, cpkh_toi: 5.3, blvh: 63.2, blntt: 47.8, blnst: 38.2, ttlr: 18.2,
    roa: 1.55, debt_equity: 8.6, roe: 18.2, cfo: 4200, casa: 15.5, npl: 1.58, nim: 3.55, car: 11.4, llr: 145.0
  },
  {
    ticker: 'STB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP SÃƒÂ i GÃƒÂ²n ThÃ†Â°Ã†Â¡ng TÃƒÂ­n', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 38.2, cpkh_toi: 5.5, blvh: 61.8, blntt: 46.5, blnst: 37.2, ttlr: 27.5,
    roa: 1.65, debt_equity: 8.2, roe: 18.8, cfo: 5500, casa: 21.2, npl: 1.28, nim: 3.75, car: 11.6, llr: 152.0
  },
  {
    ticker: 'TPB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP TiÃƒÂªn Phong', exchange: 'HOSE', industry: 'ngan-hang',
    cir: 33.8, cpkh_toi: 4.6, blvh: 66.2, blntt: 52.8, blnst: 42.2, ttlr: 22.5,
    roa: 2.25, debt_equity: 6.9, roe: 22.8, cfo: 4500, casa: 28.5, npl: 1.15, nim: 4.35, car: 13.1, llr: 180.0
  },
  {
    ticker: 'VAB', name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP ViÃ¡Â»â€¡t ÃƒÂ', exchange: 'UPCoM', industry: 'ngan-hang',
    cir: 47.5, cpkh_toi: 6.7, blvh: 52.5, blntt: 35.8, blnst: 28.6, ttlr: 13.8,
    roa: 0.85, debt_equity: 8.9, roe: 11.2, cfo: 680, casa: 13.2, npl: 1.98, nim: 2.70, car: 9.7, llr: 102.0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: BÃ¡ÂºÂ¤T Ã„ÂÃ¡Â»ËœNG SÃ¡ÂºÂ¢N Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'VHM', name: 'CTCP Vinhomes', exchange: 'HOSE', industry: 'bat-dong-san',
    cir: 22.5, cpkh_toi: 3.2, blvh: 77.5, blntt: 48.2, blnst: 38.5, ttlr: 15.2,
    roa: 8.5, debt_equity: 1.8, roe: 28.4, cfo: 18500, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'NVL', name: 'CTCP TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n Ã„ÂÃ¡ÂºÂ§u tÃ†Â° Ã„ÂÃ¡Â»â€¹a Ã¡Â»â€˜c No Va', exchange: 'HOSE', industry: 'bat-dong-san',
    cir: 31.2, cpkh_toi: 4.5, blvh: 68.8, blntt: 32.5, blnst: 25.8, ttlr: -12.5,
    roa: 1.2, debt_equity: 3.5, roe: 6.8, cfo: -2200, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'KDH', name: 'CTCP Ã„ÂÃ¡ÂºÂ§u tÃ†Â° vÃƒÂ  Kinh doanh NhÃƒÂ  Khang Ã„ÂiÃ¡Â»Ân', exchange: 'HOSE', industry: 'bat-dong-san',
    cir: 18.5, cpkh_toi: 2.8, blvh: 81.5, blntt: 55.2, blnst: 44.1, ttlr: 8.5,
    roa: 6.2, debt_equity: 0.9, roe: 18.5, cfo: 1850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'PDR', name: 'CTCP PhÃƒÂ¡t triÃ¡Â»Æ’n BÃ„ÂS PhÃƒÂ¡t Ã„ÂÃ¡ÂºÂ¡t', exchange: 'HOSE', industry: 'bat-dong-san',
    cir: 28.4, cpkh_toi: 3.9, blvh: 71.6, blntt: 42.8, blnst: 34.2, ttlr: 5.8,
    roa: 3.8, debt_equity: 2.1, roe: 14.2, cfo: 920, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'DXG', name: 'CTCP TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n Ã„ÂÃ¡ÂºÂ¥t Xanh', exchange: 'HOSE', industry: 'bat-dong-san',
    cir: 35.2, cpkh_toi: 5.1, blvh: 64.8, blntt: 28.5, blnst: 22.8, ttlr: -8.2,
    roa: 1.8, debt_equity: 2.8, roe: 8.5, cfo: -580, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: TÃƒâ‚¬I CHÃƒÂNH (CHÃ¡Â»Â¨NG KHOÃƒÂN / BÃ¡ÂºÂ¢O HIÃ¡Â»â€šM) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'SSI', name: 'CTCP ChÃ¡Â»Â©ng khoÃƒÂ¡n SSI', exchange: 'HOSE', industry: 'tai-chinh',
    cir: 28.5, cpkh_toi: 4.1, blvh: 71.5, blntt: 52.8, blnst: 42.2, ttlr: 22.5,
    roa: 5.2, debt_equity: 2.4, roe: 18.5, cfo: 4200, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'VND', name: 'CTCP ChÃ¡Â»Â©ng khoÃƒÂ¡n VNDirect', exchange: 'HOSE', industry: 'tai-chinh',
    cir: 32.1, cpkh_toi: 4.8, blvh: 67.9, blntt: 48.5, blnst: 38.8, ttlr: 18.2,
    roa: 4.8, debt_equity: 2.1, roe: 16.2, cfo: 3500, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'HCM', name: 'CTCP ChÃ¡Â»Â©ng khoÃƒÂ¡n TP.HCM', exchange: 'HOSE', industry: 'tai-chinh',
    cir: 25.8, cpkh_toi: 3.8, blvh: 74.2, blntt: 55.2, blnst: 44.1, ttlr: 25.8,
    roa: 6.1, debt_equity: 1.9, roe: 20.5, cfo: 5800, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'MBS', name: 'CTCP ChÃ¡Â»Â©ng khoÃƒÂ¡n MB', exchange: 'HNX', industry: 'tai-chinh',
    cir: 35.5, cpkh_toi: 5.2, blvh: 64.5, blntt: 42.8, blnst: 34.2, ttlr: 14.5,
    roa: 3.5, debt_equity: 2.8, roe: 14.2, cfo: 2100, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: CÃƒâ€NG NGHÃ¡Â»â€  THÃƒâ€NG TIN Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'FPT', name: 'CTCP FPT', exchange: 'HOSE', industry: 'cong-nghe',
    cir: 18.2, cpkh_toi: 2.5, blvh: 81.8, blntt: 18.5, blnst: 14.8, ttlr: 22.5,
    roa: 12.5, debt_equity: 0.8, roe: 28.5, cfo: 8500, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'CMG', name: 'CTCP TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n CÃƒÂ´ng nghÃ¡Â»â€¡ CMC', exchange: 'HOSE', industry: 'cong-nghe',
    cir: 22.5, cpkh_toi: 3.2, blvh: 77.5, blntt: 14.5, blnst: 11.6, ttlr: 18.5,
    roa: 8.5, debt_equity: 1.2, roe: 22.5, cfo: 1250, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'ELC', name: 'CTCP Ã„ÂiÃ¡Â»â€¡n tÃ¡Â»Â­ vÃƒÂ  TruyÃ¡Â»Ân hÃƒÂ¬nh CÃƒÂ¡p ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'cong-nghe',
    cir: 28.5, cpkh_toi: 4.1, blvh: 71.5, blntt: 12.5, blnst: 10.0, ttlr: 12.5,
    roa: 5.2, debt_equity: 1.5, roe: 15.8, cfo: 480, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: CÃƒâ€NG NGHIÃ¡Â»â€ P Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'HPG', name: 'CTCP TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n HÃƒÂ²a PhÃƒÂ¡t', exchange: 'HOSE', industry: 'cong-nghiep',
    cir: 12.5, cpkh_toi: 1.8, blvh: 87.5, blntt: 12.8, blnst: 10.2, ttlr: -15.2,
    roa: 4.5, debt_equity: 1.5, roe: 14.2, cfo: 15200, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'NKG', name: 'CTCP ThÃƒÂ©p Nam Kim', exchange: 'HOSE', industry: 'cong-nghiep',
    cir: 15.8, cpkh_toi: 2.2, blvh: 84.2, blntt: 8.5, blnst: 6.8, ttlr: -22.5,
    roa: 2.8, debt_equity: 2.1, roe: 8.5, cfo: 1850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'TLH', name: 'CTCP TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n ThÃƒÂ©p TiÃ¡ÂºÂ¿n LÃƒÂªn', exchange: 'HOSE', industry: 'cong-nghiep',
    cir: 18.2, cpkh_toi: 2.6, blvh: 81.8, blntt: 7.5, blnst: 6.0, ttlr: -18.5,
    roa: 2.1, debt_equity: 1.8, roe: 6.8, cfo: 420, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'VGC', name: 'TÃ¡Â»â€¢ng cÃƒÂ´ng ty Viglacera', exchange: 'HOSE', industry: 'cong-nghiep',
    cir: 22.5, cpkh_toi: 3.2, blvh: 77.5, blntt: 15.2, blnst: 12.1, ttlr: 8.5,
    roa: 5.8, debt_equity: 1.2, roe: 15.5, cfo: 2850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: CHÃ„â€šM SÃƒâ€œC SÃ¡Â»Â¨C KHOÃ¡ÂºÂº Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'DHG', name: 'CTCP DÃ†Â°Ã¡Â»Â£c HÃ¡ÂºÂ­u Giang', exchange: 'HOSE', industry: 'suc-khoe',
    cir: 25.5, cpkh_toi: 3.6, blvh: 74.5, blntt: 22.5, blnst: 18.0, ttlr: 12.5,
    roa: 15.2, debt_equity: 0.4, roe: 22.5, cfo: 1850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'IMP', name: 'CTCP DÃ†Â°Ã¡Â»Â£c phÃ¡ÂºÂ©m Imexpharm', exchange: 'HOSE', industry: 'suc-khoe',
    cir: 28.8, cpkh_toi: 4.2, blvh: 71.2, blntt: 18.5, blnst: 14.8, ttlr: 15.8,
    roa: 12.5, debt_equity: 0.6, roe: 18.5, cfo: 920, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'TRA', name: 'CTCP Traphaco', exchange: 'HOSE', industry: 'suc-khoe',
    cir: 32.2, cpkh_toi: 4.6, blvh: 67.8, blntt: 15.5, blnst: 12.4, ttlr: 10.5,
    roa: 10.2, debt_equity: 0.5, roe: 16.8, cfo: 680, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: HÃƒâ‚¬NG TIÃƒÅ U DÃƒâ„¢NG THIÃ¡ÂºÂ¾T YÃ¡ÂºÂ¾U Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'VNM', name: 'CTCP SÃ¡Â»Â¯a ViÃ¡Â»â€¡t Nam (Vinamilk)', exchange: 'HOSE', industry: 'hang-tieu-dung',
    cir: 22.5, cpkh_toi: 3.2, blvh: 77.5, blntt: 25.5, blnst: 20.4, ttlr: 5.2,
    roa: 18.5, debt_equity: 0.3, roe: 28.5, cfo: 8500, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'SAB', name: 'TÃ¡Â»â€¢ng CTCP Bia-RÃ†Â°Ã¡Â»Â£u-NGK SÃƒÂ i GÃƒÂ²n', exchange: 'HOSE', industry: 'hang-tieu-dung',
    cir: 18.8, cpkh_toi: 2.7, blvh: 81.2, blntt: 32.5, blnst: 26.0, ttlr: 8.5,
    roa: 20.5, debt_equity: 0.2, roe: 32.5, cfo: 5200, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'MSN', name: 'CTCP TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n Masan', exchange: 'HOSE', industry: 'hang-tieu-dung',
    cir: 28.5, cpkh_toi: 4.1, blvh: 71.5, blntt: 12.5, blnst: 10.0, ttlr: 15.5,
    roa: 5.8, debt_equity: 2.5, roe: 18.5, cfo: 6800, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: HÃƒâ‚¬NG TIÃƒÅ U DÃƒâ„¢NG KHÃƒâ€NG THIÃ¡ÂºÂ¾T YÃ¡ÂºÂ¾U Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'MWG', name: 'CTCP Ã„ÂÃ¡ÂºÂ§u tÃ†Â° ThÃ¡ÂºÂ¿ GiÃ¡Â»â€ºi Di Ã„ÂÃ¡Â»â„¢ng', exchange: 'HOSE', industry: 'hang-khong-thiet-yeu',
    cir: 35.5, cpkh_toi: 5.1, blvh: 64.5, blntt: 8.5, blnst: 6.8, ttlr: -12.5,
    roa: 5.2, debt_equity: 1.5, roe: 18.5, cfo: 4200, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'PNJ', name: 'CTCP VÃƒÂ ng bÃ¡ÂºÂ¡c Ã„ÂÃƒÂ¡ quÃƒÂ½ PhÃƒÂº NhuÃ¡ÂºÂ­n', exchange: 'HOSE', industry: 'hang-khong-thiet-yeu',
    cir: 25.8, cpkh_toi: 3.7, blvh: 74.2, blntt: 12.5, blnst: 10.0, ttlr: 18.5,
    roa: 15.2, debt_equity: 0.8, roe: 28.5, cfo: 2850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'FRT', name: 'CTCP BÃƒÂ¡n lÃ¡ÂºÂ» KÃ¡Â»Â¹ thuÃ¡ÂºÂ­t sÃ¡Â»â€˜ FPT', exchange: 'HOSE', industry: 'hang-khong-thiet-yeu',
    cir: 38.5, cpkh_toi: 5.5, blvh: 61.5, blntt: 5.8, blnst: 4.6, ttlr: -8.5,
    roa: 3.8, debt_equity: 2.1, roe: 12.5, cfo: 1250, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: NÃ„â€šNG LÃ†Â¯Ã¡Â»Â¢NG Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'GAS', name: 'TÃ¡Â»â€¢ng CTCP KhÃƒÂ­ ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'nang-luong',
    cir: 15.2, cpkh_toi: 2.2, blvh: 84.8, blntt: 22.5, blnst: 18.0, ttlr: 12.5,
    roa: 18.5, debt_equity: 0.5, roe: 28.5, cfo: 12500, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'PLX', name: 'TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n XÃ„Æ’ng dÃ¡ÂºÂ§u ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'nang-luong',
    cir: 18.8, cpkh_toi: 2.7, blvh: 81.2, blntt: 8.5, blnst: 6.8, ttlr: 8.5,
    roa: 5.8, debt_equity: 1.2, roe: 14.5, cfo: 4200, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'POW', name: 'TÃ¡Â»â€¢ng CTCP Ã„ÂiÃ¡Â»â€¡n lÃ¡Â»Â±c DÃ¡ÂºÂ§u khÃƒÂ­ ViÃ¡Â»â€¡t Nam', exchange: 'HOSE', industry: 'nang-luong',
    cir: 12.5, cpkh_toi: 1.8, blvh: 87.5, blntt: 10.5, blnst: 8.4, ttlr: -5.2,
    roa: 4.2, debt_equity: 1.8, roe: 10.5, cfo: 3850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: NGUYÃƒÅ N VÃ¡ÂºÂ¬T LIÃ¡Â»â€ U Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'VCS', name: 'CTCP Vicostone', exchange: 'HNX', industry: 'nguyen-vat-lieu',
    cir: 18.5, cpkh_toi: 2.6, blvh: 81.5, blntt: 28.5, blnst: 22.8, ttlr: 15.5,
    roa: 22.5, debt_equity: 0.4, roe: 35.5, cfo: 1850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'HSG', name: 'CTCP TÃ¡ÂºÂ­p Ã„â€˜oÃƒÂ n Hoa Sen', exchange: 'HOSE', industry: 'nguyen-vat-lieu',
    cir: 15.2, cpkh_toi: 2.2, blvh: 84.8, blntt: 5.8, blnst: 4.6, ttlr: -28.5,
    roa: 3.5, debt_equity: 2.5, roe: 12.5, cfo: 2850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'BMP', name: 'CTCP NhÃ¡Â»Â±a BÃƒÂ¬nh Minh', exchange: 'HOSE', industry: 'nguyen-vat-lieu',
    cir: 22.5, cpkh_toi: 3.2, blvh: 77.5, blntt: 18.5, blnst: 14.8, ttlr: 8.5,
    roa: 15.5, debt_equity: 0.3, roe: 22.5, cfo: 920, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: TIÃ¡Â»â€ N ÃƒÂCH CÃƒâ€NG CÃ¡Â»ËœNG Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'REE', name: 'CTCP CÃ†Â¡ Ã„ÂiÃ¡Â»â€¡n LÃ¡ÂºÂ¡nh', exchange: 'HOSE', industry: 'tien-ich',
    cir: 20.5, cpkh_toi: 2.9, blvh: 79.5, blntt: 35.5, blnst: 28.4, ttlr: 12.5,
    roa: 8.5, debt_equity: 1.2, roe: 18.5, cfo: 2850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'BWE', name: 'CTCP NÃ†Â°Ã¡Â»â€ºc - MÃƒÂ´i trÃ†Â°Ã¡Â»Âng BÃƒÂ¬nh DÃ†Â°Ã†Â¡ng', exchange: 'HOSE', industry: 'tien-ich',
    cir: 25.5, cpkh_toi: 3.6, blvh: 74.5, blntt: 28.5, blnst: 22.8, ttlr: 15.5,
    roa: 10.2, debt_equity: 0.8, roe: 15.5, cfo: 1250, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ NGÃƒâ‚¬NH: DÃ¡Â»Å CH VÃ¡Â»Â¤ TRUYÃ¡Â»â‚¬N THÃƒâ€NG Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  {
    ticker: 'VGI', name: 'TÃ¡Â»â€¢ng CTCP CÃƒÂ´ng nghÃ¡Â»â€¡ QuÃ¡Â»â€˜c tÃ¡ÂºÂ¿ Viettel', exchange: 'UPCoM', industry: 'truyen-thong',
    cir: 22.5, cpkh_toi: 3.2, blvh: 77.5, blntt: 18.5, blnst: 14.8, ttlr: 8.5,
    roa: 8.5, debt_equity: 1.5, roe: 18.5, cfo: 5200, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
  {
    ticker: 'VTV', name: 'Ã„ÂÃƒÂ i TruyÃ¡Â»Ân hÃƒÂ¬nh ViÃ¡Â»â€¡t Nam', exchange: 'UPCoM', industry: 'truyen-thong',
    cir: 35.5, cpkh_toi: 5.1, blvh: 64.5, blntt: 12.5, blnst: 10.0, ttlr: 5.5,
    roa: 5.2, debt_equity: 0.8, roe: 10.5, cfo: 850, casa: 0, npl: 0, nim: 0, car: 0, llr: 0
  },
];

// Chi tiáº¿t 16 hÃ ng BCTC Ä‘a niÃªn Ä‘á»™ (2015 - 2021) cho tá»«ng ngÃ¢n hÃ ng
const MOCK_FINANCIAL_STATEMENTS = {
  BAB: {
    name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP BÃ¡ÂºÂ¯c ÃƒÂ (BAB)',
    unit: 'TriÃ¡Â»â€¡u VNÃ„Â',
    years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021'],
    rows: [
      {
        id: 1,
        type: 'FILL',
        name: 'TÃ¡Â»â€¢ng thu nhÃ¡ÂºÂ­p hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng (TOI)',
        values: ['1,205,303', '1,395,598', '1,787,991', '1,996,735', '2,192,386', '2,229,528', '2,464,082'],
        bold: true,
        isNeg: false,
        isTOI: true,
        formula: 'Thu nhÃ¡ÂºÂ­p lÃƒÂ£i thuÃ¡ÂºÂ§n + Thu nhÃ¡ÂºÂ­p ngoÃƒÂ i lÃƒÂ£i (DÃ¡Â»â€¹ch vÃ¡Â»Â¥, NgoÃ¡ÂºÂ¡i hÃ¡Â»â€˜i, ChÃ¡Â»Â©ng khoÃƒÂ¡n)'
      },
      {
        id: 2,
        type: 'TÃƒÂNH',
        name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng TOI',
        values: ['-', '15.79%', '28.12%', '11.67%', '9.80%', '1.69%', '10.52%'],
        bold: false,
        isNeg: false,
        formula: '(TOI[t] - TOI[t-1]) / TOI[t-1] * 100%'
      },
      {
        id: 3,
        type: 'TÃƒÂNH',
        name: 'Chi phÃƒÂ­ vÃ¡ÂºÂ­n hÃƒÂ nh (SG & A)',
        values: ['-579,541', '-704,966', '-748,903', '-879,857', '-1,103,592', '-1,240,389', '-1,312,132'],
        bold: false,
        isNeg: true,
        formula: 'TOI * CIR * (-1)'
      },
      {
        id: 4,
        type: 'FILL',
        name: 'TÃ¡Â»Â· lÃ¡Â»â€¡ Chi phÃƒÂ­ / Thu nhÃ¡ÂºÂ­p (CIR)',
        values: ['48.08%', '50.51%', '41.89%', '-44.06%', '-50.34%', '-55.63%', '-53.25%'],
        bold: false,
        isNeg: false,
        formula: 'Chi phÃƒÂ­ hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng / TÃ¡Â»â€¢ng thu nhÃ¡ÂºÂ­p hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng * 100%'
      },
      {
        id: 5,
        type: 'TÃƒÂNH',
        name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng CPVH',
        values: ['-', '21.64%', '6.23%', '17.49%', '25.43%', '12.40%', '5.78%'],
        bold: false,
        isNeg: false,
        formula: '(CPVH[t] - CPVH[t-1]) / CPVH[t-1] * 100%'
      },
      {
        id: 6,
        type: 'FILL',
        name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n thuÃ¡ÂºÂ§n tÃ¡Â»Â« hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng kinh doanh trÃ†Â°Ã¡Â»â€ºc chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro',
        values: ['625,762', '690,632', '1,039,088', '1,116,878', '1,088,794', '989,139', '1,151,950'],
        bold: false,
        isNeg: false,
        formula: 'TÃ¡Â»â€¢ng thu nhÃ¡ÂºÂ­p hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng (TOI) - Chi phÃƒÂ­ vÃ¡ÂºÂ­n hÃƒÂ nh'
      },
      {
        id: 7,
        type: 'TÃƒÂNH',
        name: 'BiÃƒÂªn lÃƒÂ£i vÃ¡ÂºÂ­n hÃƒÂ nh (trÃ†Â°Ã¡Â»â€ºc DPRR)',
        values: ['51.92%', '49.49%', '58.11%', '55.94%', '49.66%', '44.37%', '46.75%'],
        bold: false,
        isNeg: false,
        formula: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n thuÃ¡ÂºÂ§n trÃ†Â°Ã¡Â»â€ºc DPRR / TOI * 100%'
      },
      {
        id: 8,
        type: 'FILL',
        name: 'Chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro tÃƒÂ­n dÃ¡Â»Â¥ng',
        values: ['173,057', '64,007', '296,423', '-274,412', '-154,901', '-254,326', '-243,588'],
        bold: false,
        isNeg: false,
        formula: 'DÃ¡Â»Â± phÃƒÂ²ng chung + DÃ¡Â»Â± phÃƒÂ²ng cÃ¡Â»Â¥ thÃ¡Â»Æ’ trÃƒÂ­ch lÃ¡ÂºÂ­p trong kÃ¡Â»Â³'
      },
      {
        id: 9,
        type: 'FILL',
        name: 'TÃ¡Â»â€¢ng lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿ (PBT)',
        values: ['452,705', '626,625', '742,665', '842,466', '933,893', '734,813', '908,362'],
        bold: true,
        isNeg: false,
        isPBT: true,
        formula: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n thuÃ¡ÂºÂ§n trÃ†Â°Ã¡Â»â€ºc DPRR - Chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro tÃƒÂ­n dÃ¡Â»Â¥ng'
      },
      {
        id: 10,
        type: 'TÃƒÂNH',
        name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿',
        values: ['37.56%', '44.90%', '41.54%', '42.19%', '42.60%', '32.96%', '36.86%'],
        bold: false,
        isNeg: false,
        formula: 'TÃ¡Â»â€¢ng lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿ (PBT) / TOI * 100%'
      },
      {
        id: 11,
        type: 'FILL',
        name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p',
        values: ['380,408', '500,686', '602,472', '677,210', '749,456', '587,794', '726,337'],
        bold: true,
        isNeg: false,
        isNPAT: true,
        formula: 'PBT - Chi phÃƒÂ­ thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p (hiÃ¡Â»â€¡n hÃƒÂ nh + hoÃƒÂ£n lÃ¡ÂºÂ¡i)'
      },
      {
        id: 12,
        type: 'TÃƒÂNH',
        name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p',
        values: ['31.56%', '35.88%', '33.70%', '33.92%', '34.18%', '26.36%', '29.48%'],
        bold: false,
        isNeg: false,
        formula: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ (NPAT) / TOI * 100%'
      },
      {
        id: 13,
        type: 'FILL',
        name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ cÃ¡Â»Â§a cÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng cÃƒÂ´ng ty mÃ¡ÂºÂ¹',
        values: ['380,408', '500,686', '602,472', '677,210', '749,456', '587,794', '726,337'],
        bold: false,
        isNeg: false,
        formula: 'NPAT - LÃ¡Â»Â£i ÃƒÂ­ch cÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng khÃƒÂ´ng kiÃ¡Â»Æ’m soÃƒÂ¡t (thiÃ¡Â»Æ’u sÃ¡Â»â€˜)'
      },
      {
        id: 14,
        type: 'TÃƒÂNH',
        name: 'BiÃƒÂªn LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n ST cÃ¡Â»Â§a CÃ„Â cÃƒÂ´ng ty mÃ¡ÂºÂ¹',
        values: ['31.56%', '35.88%', '33.70%', '33.92%', '34.18%', '26.36%', '29.48%'],
        bold: false,
        isNeg: false,
        formula: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ CÃ„Â cÃƒÂ´ng ty mÃ¡ÂºÂ¹ / TOI * 100%'
      },
      {
        id: 15,
        type: 'TÃƒÂNH',
        name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng lÃƒÂ£i rÃƒÂ²ng sau CÃ„Â thiÃ¡Â»Æ’u sÃ¡Â»â€˜',
        values: ['-', '31.62%', '20.33%', '12.41%', '10.67%', '-21.57%', '23.57%'],
        bold: false,
        isNeg: false,
        formula: '(LÃƒÂ£i rÃƒÂ²ng CÃ„Â mÃ¡ÂºÂ¹[t] - LÃƒÂ£i rÃƒÂ²ng CÃ„Â mÃ¡ÂºÂ¹[t-1]) / LÃƒÂ£i rÃƒÂ²ng CÃ„Â mÃ¡ÂºÂ¹[t-1] * 100%'
      },
      {
        id: 16,
        type: 'FILL',
        name: 'LÃƒÂ£i cÃ†Â¡ bÃ¡ÂºÂ£n trÃƒÂªn cÃ¡Â»â€¢ phiÃ¡ÂºÂ¿u (EPS)',
        values: ['829', '1,034', '1,205', '1,235', '1,238', '830', '967'],
        bold: false,
        isNeg: false,
        formula: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n CÃ„Â cÃƒÂ´ng ty mÃ¡ÂºÂ¹ / SÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£ng cÃ¡Â»â€¢ phiÃ¡ÂºÂ¿u lÃ†Â°u hÃƒÂ nh bÃƒÂ¬nh quÃƒÂ¢n'
      }
    ]
  },
  ACB: {
    name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP ÃƒÂ ChÃƒÂ¢u (ACB)',
    unit: 'TriÃ¡Â»â€¡u VNÃ„Â',
    years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021'],
    rows: [
      { id: 1, type: 'FILL', name: 'TÃ¡Â»â€¢ng thu nhÃ¡ÂºÂ­p hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng (TOI)', values: ['7,417,960', '9,352,910', '11,378,020', '13,759,400', '16,459,340', '19,600,990', '23,331,500'], bold: true, isNeg: false, isTOI: true, formula: 'Thu nhÃ¡ÂºÂ­p lÃƒÂ£i thuÃ¡ÂºÂ§n + NgoÃƒÂ i lÃƒÂ£i' },
      { id: 2, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng TOI', values: ['-', '26.08%', '21.65%', '20.93%', '19.62%', '19.09%', '19.03%'], bold: false, isNeg: false, formula: '(TOI[t] - TOI[t-1]) / TOI[t-1] * 100%' },
      { id: 3, type: 'TÃƒÂNH', name: 'Chi phÃƒÂ­ vÃ¡ÂºÂ­n hÃƒÂ nh (SG & A)', values: ['-4,120,450', '-4,850,120', '-5,640,820', '-6,420,180', '-7,120,450', '-7,890,240', '-8,540,120'], bold: false, isNeg: true, formula: 'TOI * CIR * (-1)' },
      { id: 4, type: 'FILL', name: 'TÃ¡Â»Â· lÃ¡Â»â€¡ Chi phÃƒÂ­ / Thu nhÃ¡ÂºÂ­p (CIR)', values: ['55.55%', '51.86%', '49.58%', '46.66%', '43.26%', '40.25%', '36.60%'], bold: false, isNeg: false, formula: 'Chi phÃƒÂ­ hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng / TOI * 100%' },
      { id: 5, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng CPVH', values: ['-', '17.71%', '16.30%', '13.82%', '10.91%', '10.81%', '8.24%'], bold: false, isNeg: false, formula: '(CPVH[t] - CPVH[t-1]) / CPVH[t-1] * 100%' },
      { id: 6, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n thuÃ¡ÂºÂ§n tÃ¡Â»Â« hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng kinh doanh trÃ†Â°Ã¡Â»â€ºc chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro', values: ['3,297,510', '4,502,790', '5,737,200', '7,339,220', '9,338,890', '11,710,750', '14,791,380'], bold: false, isNeg: false, formula: 'TOI - CPVH' },
      { id: 7, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃƒÂ£i vÃ¡ÂºÂ­n hÃƒÂ nh (trÃ†Â°Ã¡Â»â€ºc DPRR)', values: ['44.45%', '48.14%', '50.42%', '53.34%', '56.74%', '59.75%', '63.40%'], bold: false, isNeg: false, formula: 'LN trÃ†Â°Ã¡Â»â€ºc DPRR / TOI * 100%' },
      { id: 8, type: 'FILL', name: 'Chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro tÃƒÂ­n dÃ¡Â»Â¥ng', values: ['-1,980,450', '-2,150,120', '-1,850,450', '-1,450,210', '-1,250,450', '-1,420,180', '-1,850,420'], bold: false, isNeg: true, formula: 'Chi phÃƒÂ­ DPRR phÃƒÂ¡t sinh trong kÃ¡Â»Â³' },
      { id: 9, type: 'FILL', name: 'TÃ¡Â»â€¢ng lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿ (PBT)', values: ['1,317,060', '2,352,670', '3,886,750', '5,889,010', '8,088,440', '10,290,570', '12,940,960'], bold: true, isNeg: false, isPBT: true, formula: 'LN trÃ†Â°Ã¡Â»â€ºc DPRR - Chi phÃƒÂ­ DPRR' },
      { id: 10, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿', values: ['17.75%', '25.15%', '34.16%', '42.80%', '49.14%', '52.50%', '55.47%'], bold: false, isNeg: false, formula: 'PBT / TOI * 100%' },
      { id: 11, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p', values: ['1,053,648', '1,882,136', '3,109,400', '4,711,208', '6,470,752', '8,232,456', '10,352,768'], bold: true, isNeg: false, isNPAT: true, formula: 'PBT - Chi phÃƒÂ­ thuÃ¡ÂºÂ¿ TNDN' },
      { id: 12, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p', values: ['14.20%', '20.12%', '27.33%', '34.24%', '39.31%', '42.00%', '44.37%'], bold: false, isNeg: false, formula: 'NPAT / TOI * 100%' },
      { id: 13, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ cÃ¡Â»Â§a cÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng cÃƒÂ´ng ty mÃ¡ÂºÂ¹', values: ['1,053,648', '1,882,136', '3,109,400', '4,711,208', '6,470,752', '8,232,456', '10,352,768'], bold: false, isNeg: false, formula: 'NPAT - CÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng thiÃ¡Â»Æ’u sÃ¡Â»â€˜' },
      { id: 14, type: 'TÃƒÂNH', name: 'BiÃƒÂªn LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n ST cÃ¡Â»Â§a CÃ„Â cÃƒÂ´ng ty mÃ¡ÂºÂ¹', values: ['14.20%', '20.12%', '27.33%', '34.24%', '39.31%', '42.00%', '44.37%'], bold: false, isNeg: false, formula: 'NPAT mÃ¡ÂºÂ¹ / TOI * 100%' },
      { id: 15, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng lÃƒÂ£i rÃƒÂ²ng sau CÃ„Â thiÃ¡Â»Æ’u sÃ¡Â»â€˜', values: ['-', '78.63%', '65.21%', '51.52%', '37.35%', '27.23%', '25.76%'], bold: false, isNeg: false, formula: '(NPAT[t] - NPAT[t-1]) / NPAT[t-1] * 100%' },
      { id: 16, type: 'FILL', name: 'LÃƒÂ£i cÃ†Â¡ bÃ¡ÂºÂ£n trÃƒÂªn cÃ¡Â»â€¢ phiÃ¡ÂºÂ¿u (EPS)', values: ['1,120', '1,980', '2,850', '3,620', '4,150', '4,380', '4,650'], bold: false, isNeg: false, formula: 'LN CÃ„Â mÃ¡ÂºÂ¹ / SÃ¡Â»â€˜ CP lÃ†Â°u hÃƒÂ nh' }
    ]
  },
  VCB: {
    name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP NgoÃ¡ÂºÂ¡i thÃ†Â°Ã†Â¡ng ViÃ¡Â»â€¡t Nam (VCB)',
    unit: 'TriÃ¡Â»â€¡u VNÃ„Â',
    years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021'],
    rows: [
      { id: 1, type: 'FILL', name: 'TÃ¡Â»â€¢ng thu nhÃ¡ÂºÂ­p hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng (TOI)', values: ['19,441,020', '23,801,230', '28,991,370', '36,511,530', '45,600,870', '52,341,240', '60,581,590'], bold: true, isNeg: false, isTOI: true, formula: 'NII + PhÃƒÂ­ dÃ¡Â»â€¹ch vÃ¡Â»Â¥ + NgoÃ¡ÂºÂ¡i hÃ¡Â»â€˜i + CK' },
      { id: 2, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng TOI', values: ['-', '22.43%', '21.81%', '25.94%', '24.90%', '14.78%', '15.74%'], bold: false, isNeg: false, formula: '(TOI[t] - TOI[t-1]) / TOI[t-1] * 100%' },
      { id: 3, type: 'TÃƒÂNH', name: 'Chi phÃƒÂ­ vÃ¡ÂºÂ­n hÃƒÂ nh (SG & A)', values: ['-8,540,120', '-9,850,420', '-11,450,180', '-13,540,120', '-15,890,450', '-17,240,180', '-18,950,420'], bold: false, isNeg: true, formula: 'TOI * CIR * (-1)' },
      { id: 4, type: 'FILL', name: 'TÃ¡Â»Â· lÃ¡Â»â€¡ Chi phÃƒÂ­ / Thu nhÃ¡ÂºÂ­p (CIR)', values: ['43.93%', '41.39%', '39.49%', '37.08%', '34.85%', '32.94%', '31.28%'], bold: false, isNeg: false, formula: 'Chi phÃƒÂ­ hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng / TOI * 100%' },
      { id: 5, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng CPVH', values: ['-', '15.34%', '16.24%', '18.25%', '17.36%', '8.50%', '9.92%'], bold: false, isNeg: false, formula: '(CPVH[t] - CPVH[t-1]) / CPVH[t-1] * 100%' },
      { id: 6, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n thuÃ¡ÂºÂ§n tÃ¡Â»Â« hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng kinh doanh trÃ†Â°Ã¡Â»â€ºc chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro', values: ['10,900,900', '13,950,810', '17,541,190', '22,971,410', '29,710,420', '35,101,060', '41,631,170'], bold: false, isNeg: false, formula: 'TOI - CPVH' },
      { id: 7, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃƒÂ£i vÃ¡ÂºÂ­n hÃƒÂ nh (trÃ†Â°Ã¡Â»â€ºc DPRR)', values: ['56.07%', '58.61%', '60.51%', '62.92%', '65.15%', '67.06%', '68.72%'], bold: false, isNeg: false, formula: 'LN trÃ†Â°Ã¡Â»â€ºc DPRR / TOI * 100%' },
      { id: 8, type: 'FILL', name: 'Chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro tÃƒÂ­n dÃ¡Â»Â¥ng', values: ['-4,120,450', '-5,420,180', '-6,240,150', '-7,120,450', '-8,240,180', '-9,120,450', '-10,450,180'], bold: false, isNeg: true, formula: 'Chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng trÃƒÂ­ch lÃ¡ÂºÂ­p' },
      { id: 9, type: 'FILL', name: 'TÃ¡Â»â€¢ng lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿ (PBT)', values: ['6,780,450', '8,530,630', '11,301,040', '15,850,960', '21,470,240', '25,980,610', '31,180,990'], bold: true, isNeg: false, isPBT: true, formula: 'LN trÃ†Â°Ã¡Â»â€ºc DPRR - Chi phÃƒÂ­ DPRR' },
      { id: 10, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿', values: ['34.88%', '35.84%', '38.98%', '43.41%', '47.08%', '49.64%', '51.47%'], bold: false, isNeg: false, formula: 'PBT / TOI * 100%' },
      { id: 11, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p', values: ['5,424,360', '6,824,504', '9,040,832', '12,680,768', '17,176,192', '20,784,488', '24,944,792'], bold: true, isNeg: false, isNPAT: true, formula: 'PBT - Chi phÃƒÂ­ thuÃ¡ÂºÂ¿ TNDN' },
      { id: 12, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p', values: ['27.90%', '28.67%', '31.18%', '34.73%', '37.67%', '39.71%', '41.18%'], bold: false, isNeg: false, formula: 'NPAT / TOI * 100%' },
      { id: 13, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ cÃ¡Â»Â§a cÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng cÃƒÂ´ng ty mÃ¡ÂºÂ¹', values: ['5,424,360', '6,824,504', '9,040,832', '12,680,768', '17,176,192', '20,784,488', '24,944,792'], bold: false, isNeg: false, formula: 'NPAT - CÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng thiÃ¡Â»Æ’u sÃ¡Â»â€˜' },
      { id: 14, type: 'TÃƒÂNH', name: 'BiÃƒÂªn LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n ST cÃ¡Â»Â§a CÃ„Â cÃƒÂ´ng ty mÃ¡ÂºÂ¹', values: ['27.90%', '28.67%', '31.18%', '34.73%', '37.67%', '39.71%', '41.18%'], bold: false, isNeg: false, formula: 'NPAT mÃ¡ÂºÂ¹ / TOI * 100%' },
      { id: 15, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng lÃƒÂ£i rÃƒÂ²ng sau CÃ„Â thiÃ¡Â»Æ’u sÃ¡Â»â€˜', values: ['-', '25.81%', '32.48%', '40.26%', '35.45%', '21.01%', '20.02%'], bold: false, isNeg: false, formula: '(NPAT[t] - NPAT[t-1]) / NPAT[t-1] * 100%' },
      { id: 16, type: 'FILL', name: 'LÃƒÂ£i cÃ†Â¡ bÃ¡ÂºÂ£n trÃƒÂªn cÃ¡Â»â€¢ phiÃ¡ÂºÂ¿u (EPS)', values: ['1,820', '2,150', '2,740', '3,450', '4,280', '4,850', '5,320'], bold: false, isNeg: false, formula: 'LN CÃ„Â mÃ¡ÂºÂ¹ / SÃ¡Â»â€˜ CP lÃ†Â°u hÃƒÂ nh' }
    ]
  },
  MBB: {
    name: 'NgÃƒÂ¢n hÃƒÂ ng TMCP QuÃƒÂ¢n Ã„ÂÃ¡Â»â„¢i (MBB)',
    unit: 'TriÃ¡Â»â€¡u VNÃ„Â',
    years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021'],
    rows: [
      { id: 1, type: 'FILL', name: 'TÃ¡Â»â€¢ng thu nhÃ¡ÂºÂ­p hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng (TOI)', values: ['9,261,550', '11,521,030', '14,431,250', '18,171,650', '22,611,090', '26,281,010', '32,901,550'], bold: true, isNeg: false, isTOI: true, formula: 'NII + Thu dÃ¡Â»â€¹ch vÃ¡Â»Â¥ + NgoÃ¡ÂºÂ¡i hÃ¡Â»â€˜i + CK' },
      { id: 2, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng TOI', values: ['-', '24.40%', '25.26%', '25.92%', '24.43%', '16.23%', '25.19%'], bold: false, isNeg: false, formula: '(TOI[t] - TOI[t-1]) / TOI[t-1] * 100%' },
      { id: 3, type: 'TÃƒÂNH', name: 'Chi phÃƒÂ­ vÃ¡ÂºÂ­n hÃƒÂ nh (SG & A)', values: ['-4,180,450', '-5,020,180', '-5,980,450', '-7,120,450', '-8,540,120', '-9,850,420', '-11,240,180'], bold: false, isNeg: true, formula: 'TOI * CIR * (-1)' },
      { id: 4, type: 'FILL', name: 'TÃ¡Â»Â· lÃ¡Â»â€¡ Chi phÃƒÂ­ / Thu nhÃ¡ÂºÂ­p (CIR)', values: ['45.14%', '43.57%', '41.44%', '39.18%', '37.77%', '37.48%', '34.16%'], bold: false, isNeg: false, formula: 'Chi phÃƒÂ­ hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng / TOI * 100%' },
      { id: 5, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng CPVH', values: ['-', '20.09%', '19.13%', '19.06%', '19.94%', '15.34%', '14.11%'], bold: false, isNeg: false, formula: '(CPVH[t] - CPVH[t-1]) / CPVH[t-1] * 100%' },
      { id: 6, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n thuÃ¡ÂºÂ§n tÃ¡Â»Â« hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng kinh doanh trÃ†Â°Ã¡Â»â€ºc chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro', values: ['5,081,100', '6,500,850', '8,450,800', '11,051,200', '14,070,970', '16,430,590', '21,661,370'], bold: false, isNeg: false, formula: 'TOI - CPVH' },
      { id: 7, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃƒÂ£i vÃ¡ÂºÂ­n hÃƒÂ nh (trÃ†Â°Ã¡Â»â€ºc DPRR)', values: ['54.86%', '56.43%', '58.56%', '60.82%', '62.23%', '62.52%', '65.84%'], bold: false, isNeg: false, formula: 'LN trÃ†Â°Ã¡Â»â€ºc DPRR / TOI * 100%' },
      { id: 8, type: 'FILL', name: 'Chi phÃƒÂ­ dÃ¡Â»Â± phÃƒÂ²ng rÃ¡Â»Â§i ro tÃƒÂ­n dÃ¡Â»Â¥ng', values: ['-1,860,450', '-2,150,120', '-2,840,150', '-3,420,180', '-4,050,120', '-4,890,240', '-5,120,450'], bold: false, isNeg: true, formula: 'DPRR tÃƒÂ­n dÃ¡Â»Â¥ng phÃƒÂ¡t sinh' },
      { id: 9, type: 'FILL', name: 'TÃ¡Â»â€¢ng lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿ (PBT)', values: ['3,220,650', '4,350,730', '5,610,650', '7,631,020', '10,020,850', '11,540,350', '16,540,920'], bold: true, isNeg: false, isPBT: true, formula: 'LN trÃ†Â°Ã¡Â»â€ºc DPRR - Chi phÃƒÂ­ DPRR' },
      { id: 10, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n trÃ†Â°Ã¡Â»â€ºc thuÃ¡ÂºÂ¿', values: ['34.77%', '37.76%', '38.88%', '42.00%', '44.32%', '43.91%', '50.27%'], bold: false, isNeg: false, formula: 'PBT / TOI * 100%' },
      { id: 11, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p', values: ['2,576,520', '3,480,584', '4,488,520', '6,104,816', '8,016,680', '9,232,280', '13,232,736'], bold: true, isNeg: false, isNPAT: true, formula: 'PBT - Chi phÃƒÂ­ thuÃ¡ÂºÂ¿ TNDN' },
      { id: 12, type: 'TÃƒÂNH', name: 'BiÃƒÂªn lÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ thu nhÃ¡ÂºÂ­p doanh nghiÃ¡Â»â€¡p', values: ['27.82%', '30.21%', '31.10%', '33.60%', '35.45%', '35.13%', '40.22%'], bold: false, isNeg: false, formula: 'NPAT / TOI * 100%' },
      { id: 13, type: 'FILL', name: 'LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n sau thuÃ¡ÂºÂ¿ cÃ¡Â»Â§a cÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng cÃƒÂ´ng ty mÃ¡ÂºÂ¹', values: ['2,576,520', '3,480,584', '4,488,520', '6,104,816', '8,016,680', '9,232,280', '13,232,736'], bold: false, isNeg: false, formula: 'NPAT - CÃ¡Â»â€¢ Ã„â€˜ÃƒÂ´ng thiÃ¡Â»Æ’u sÃ¡Â»â€˜' },
      { id: 14, type: 'TÃƒÂNH', name: 'BiÃƒÂªn LÃ¡Â»Â£i nhuÃ¡ÂºÂ­n ST cÃ¡Â»Â§a CÃ„Â cÃƒÂ´ng ty mÃ¡ÂºÂ¹', values: ['27.82%', '30.21%', '31.10%', '33.60%', '35.45%', '35.13%', '40.22%'], bold: false, isNeg: false, formula: 'NPAT mÃ¡ÂºÂ¹ / TOI * 100%' },
      { id: 15, type: 'TÃƒÂNH', name: 'TÃ„Æ’ng trÃ†Â°Ã¡Â»Å¸ng lÃƒÂ£i rÃƒÂ²ng sau CÃ„Â thiÃ¡Â»Æ’u sÃ¡Â»â€˜', values: ['-', '35.09%', '28.96%', '36.01%', '31.32%', '15.16%', '43.33%'], bold: false, isNeg: false, formula: '(NPAT[t] - NPAT[t-1]) / NPAT[t-1] * 100%' },
      { id: 16, type: 'FILL', name: 'LÃƒÂ£i cÃ†Â¡ bÃ¡ÂºÂ£n trÃƒÂªn cÃ¡Â»â€¢ phiÃ¡ÂºÂ¿u (EPS)', values: ['1,450', '1,890', '2,320', '2,890', '3,420', '3,650', '4,180'], bold: false, isNeg: false, formula: 'LN CÃ„Â mÃ¡ÂºÂ¹ / SÃ¡Â»â€˜ CP lÃ†Â°u hÃƒÂ nh' }
    ]
  }
};

/**
 * LÃ¡ÂºÂ¥y BCTC cho mÃ¡Â»â„¢t mÃƒÂ£ ngÃƒÂ¢n hÃƒÂ ng, nÃ¡ÂºÂ¿u chÃ†Â°a cÃƒÂ³ dÃ¡Â»Â¯ liÃ¡Â»â€¡u riÃƒÂªng thÃƒÂ¬ sinh tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng
 */
function getFinancialStatement(ticker) {
  if (!ticker) ticker = 'BAB';
  ticker = ticker.toUpperCase();
  if (MOCK_FINANCIAL_STATEMENTS[ticker]) {
    return MOCK_FINANCIAL_STATEMENTS[ticker];
  }

  // TÃƒÂ¬m trong danh sÃƒÂ¡ch ngÃƒÂ¢n hÃƒÂ ng
  const bank = MOCK_BANKS.find(b => b.ticker === ticker) || {
    ticker: ticker,
    name: `NgÃƒÂ¢n hÃƒÂ ng TMCP ${ticker}`,
    exchange: 'HOSE'
  };

  // TrÃ¡ÂºÂ£ vÃ¡Â»Â bÃ¡ÂºÂ£n ghi mÃ¡ÂºÂ«u chuÃ¡ÂºÂ©n dÃ¡Â»Â±a trÃƒÂªn BAB vÃ¡Â»â€ºi tÃƒÂªn Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â»â€¢i vÃƒÂ  tÃ¡Â»Â· lÃ¡Â»â€¡ tÃ†Â°Ã†Â¡ng Ã¡Â»Â©ng
  const base = JSON.parse(JSON.stringify(MOCK_FINANCIAL_STATEMENTS['BAB']));
  base.name = `${bank.name} (${ticker})`;
  return base;
}

