# SDRI v1: kerangka GSI (gerbang PPC, copies/mL, fold regulation amoA, ambang X1-X12)
# digabung dengan struktur v0 (maks patogen, lingkungan memperberat, indeks bukan probabilitas).
import math
def clamp(x,a=0,b=100): return max(a,min(b,x))
def lerp(x,x0,x1,y0,y1): return clamp(y0+(y1-y0)*(x-x0)/(x1-x0),min(y0,y1),max(y0,y1))
def nrxn(ct): return 10**((36.6-ct)/3.35)
LOD_RXN, LLOQ_RXN = 3, 10          # MIQE 2.0: LOD >= 3 salinan, LLOQ ~10 salinan per reaksi
FLOOR={'pirA':60,'vp28':75,'swp1':40}
def s_patho(cts):
    out={}
    for p,ct in cts.items():
        if ct is None or ct>=35: out[p]=(0,'ND'); continue
        n=nrxn(ct); c=n*0.08
        if n<LLOQ_RXN: out[p]=(25,f'terdeteksi <LLOQ ({n:.1f} salinan/rxn)'); continue
        out[p]=(round(lerp(math.log10(c),0,3,FLOOR[p],100),1),f'{c:.3g} copies/mL')
    return max(v[0] for v in out.values()),out
def band(x,safe,warn,crit_end,higher_bad=True):
    # 0 bila aman, 40-69 zona peringatan, 70-100 zona kritis (ambang GSI X7-X12)
    if not higher_bad: x,safe,warn,crit_end=-x,-safe,-warn,-crit_end
    if x<=safe: return 0
    if x<=warn: return lerp(x,safe,warn,40,69)
    return lerp(x,warn,crit_end,70,100)
def s_chem(w):
    t=w['t']; pka=0.09018+2729.92/(t+273.15); n3=w['tan']/(10**(pka-w['ph'])+1)
    pen={'NH3':band(n3,0.05,0.10,0.30),'NO2':band(w['no2'],0.5,1.0,3.0),'H2S':band(w['h2s'],0.005,0.010,0.05),
         'DO':band(w['do'],5.0,4.0,2.0,False),'TOM':band(w['tom'],70,90,150),'Alk':band(w['alk'],120,100,60,False)}
    return max(pen.values()),{k:round(v) for k,v in pen.items()}
def s_nitri(fr):  # fold regulation amoA vs CTRL (GSI X2)
    if fr>=1: return 0
    if fr>=-2: return 40
    return lerp(fr,-2,-8,70,100)
def sdri(sp,sc,sn,sm=None):
    parts=[(0.5,sc),(0.25,sn)]+([(0.25,sm)] if sm is not None else [])
    E=sum(w*v for w,v in parts)/sum(w for w,_ in parts)/100
    return round(sp+(100-sp)*0.69*E,1)
def kelas(x): return 'Aman' if x<20 else 'Pantau' if x<40 else 'Waspada' if x<70 else 'Kritis'
D={ 'CTRL':(19.95,dict(tan=.25,ph=7.8,t=30,no2=.08,h2s=.001,do=6.4,tom=34.5,alk=140),1.00,{'pirA':None,'vp28':None,'swp1':None}),
    'POND-BIO':(19.95,dict(tan=.6,ph=7.9,t=30,no2=.35,h2s=.002,do=5.8,tom=78,alk=165),99.04,{'pirA':34.25,'vp28':None,'swp1':None}),
    'POND-TOX':(19.95,dict(tan=3.2,ph=8.4,t=30,no2=4.85,h2s=.092,do=2.65,tom=128.4,alk=82),-3.95,{'pirA':18.84,'vp28':None,'swp1':25.16}),
    'POND-REM':(19.95,dict(tan=.45,ph=7.85,t=30,no2=.42,h2s=.004,do=5.5,tom=52,alk=148),10.41,{'pirA':27.89,'vp28':None,'swp1':28.56}),
    'UNK-HUMIC':(24.46,None,None,None)}
for n,(ppc,w,fr,cts) in D.items():
    if ppc>22: print(f'{n}: DITOLAK (PPC {ppc} > 22, inhibisi). Purifikasi/encerkan 1:10 lalu uji ulang.'); continue
    sp,dp=s_patho(cts); sc,pc=s_chem(w); sn=s_nitri(fr); s=sdri(sp,sc,sn)
    print(f'{n}: Patho={sp} {dp}\n   Chem={sc:.0f} {pc} Nitri={sn:.0f} -> SDRI={s} {kelas(s)}')
