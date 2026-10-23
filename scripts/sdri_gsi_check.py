# Hitung ulang SDRI dari dokumen kerangka GSI (Bagian 7.3) untuk uji emas.
import math
def nh3(tan,ph,t,pka=None):
    pka=pka or 0.09018+2729.92/(t+273.15); return tan/(10**(pka-ph)+1)
def copies_ml(ct): return 0 if ct is None or ct>=40 else 10**((36.6-ct)/3.35)*20/250
def copies_rxn(ct): return 10**((36.6-ct)/3.35)
S={ # tan, ph, t, no2, h2s, tom, ct_amoA, ct_pirA, ct_swp1, ppc, doc(Z, P)
 'CTRL':     (0.25,7.80,30,0.08,0.001,34.5,26.20,None,None,19.95,(-7.83,0.04)),
 'POND-BIO': (0.60,7.90,30,0.35,0.002,78.0,19.55,34.25,None,19.95,(-8.75,0.02)),
 'POND-TOX': (3.20,8.40,30,4.85,0.092,128.4,28.22,18.84,25.16,19.95,(10.80,99.998)),
 'POND-REM': (0.45,7.85,30,0.42,0.004,52.0,22.87,27.89,28.56,19.95,(-5.24,34.80)),
 'UNK-HUMIC':(0.85,7.60,30,0.60,0.008,112.0,24.13,31.24,None,24.46,None),
}
for n,(tan,ph,t,no2,h2s,tom,ca,cp,ce,ppc,doc) in S.items():
    n3=nh3(tan,ph,t,9.10); cp_ml=copies_ml(cp); ce_ml=copies_ml(ce)
    sq=math.log10(cp_ml+1)
    for lbl,amo in (('amoA/rxn',copies_rxn(ca)),('amoA/mL',copies_rxn(ca)*0.08)):
        sb=math.log10((cp_ml+1)/(amo+1)); sc=n3/0.1+no2/1+h2s/0.01+tom/90
        z=-6.5+1.2*sq+0.85*sb+0.7*sc; p=100/(1+math.exp(-z))
        print(f"{n:9} [{lbl:8}] PPC={'TOLAK' if ppc>22 else 'OK'} NH3={n3:.4f} pirA/mL={cp_ml:.3g} EHP/mL={ce_ml:.3g} "
              f"w1S={1.2*sq:.2f} w2S={0.85*sb:.2f} w3S={0.7*sc:.2f} Z={z:.2f} P={p:.3f}%  dok={doc}")
