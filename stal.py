# -*- coding: utf-8 -*-
"""
Created on Tue Sep 30 10:34:20 2025

@author: Joseph.Montesano

https://medium.com/agoda-engineering/why-we-use-lenient-p-value-thresholds-like-0-4-for-a-b-experiments-at-agoda-part-1-e93c7c56e666
https://medium.com/agoda-engineering/why-we-use-lenient-p-value-thresholds-like-0-4-for-a-b-experiments-at-agoda-part-2-a50481cad144
"""

import pandas as pd 
pd.options.mode.chained_assignment = None  # default='warn'
import numpy as np
import math
import matplotlib.pyplot as plt
import scipy.integrate as intg
import scipy.stats as stat





"""

observeZList is a list of Z scores from a particulat client for a specific goal
TODO: make arrays of control/variation visitors conversions to calculate z scores in the script

STAl: Sum taken actual Lift

"""


def p2z(inp):
    return -stat.norm(0,1).ppf(inp)
def z2p(inp):
    return 1.0-stat.norm(0,1).cdf(inp)


nocZListVisitsToRentals = [-1.082185504,	0.1541443979,	-0.2224650519,	0.2465846122,	0.7536690255,	-0.4975420695,	0.2015309513 ]
usPolo = [1.88, 1.42, 1.28, 1.40, -.35, .5, 1.29, 1.68, 2.61, 1.58, 2.12, 1.75, 2.75, 1.64, -1.37, -2.01, -.5, -.19, -.5, -.25, 1.39, .59, 0.8397503128,-2.430752341, -0.3304095674,	2.22075879,	-0.9672054116,	1.876152234,	0.8585700308,	1.93604673,	-1.434911867,	0.8946295767,	-2.724428228,	-0.734995604,	-1.204166838,	-1.198142996,	0.1622993876,	-4.728755245, -0.4502193553,	-1.9231585,	-1.568561402,	-1.490698236,	-0.08995976069,	1.752277513,	-1.207711487,	-0.797510753,	0.6737212435,	-0.5477468631,	0.2788794792,	3.893802849,	-0.6063166246,	-1.185349924]
observeZList = np.random.normal(1.0,2.0, 100)
rowan = [-1.135681928,	7.613831723,	1.3842658,	-9.82175901,	-3.55561438]
nocturne = [-0.2009151276,	-1.249633117,	-0.4736824548,	0.2411905556,	-0.3084420847,	0.1123698704,	1.443800999,	-0.9021535443,	-0.02791366399,	0.291176129,	0.2119391718,	1.709668199,	-0.4991262036,	-0.4127763362]


average = sum(observeZList) / len(observeZList)
averagePolo = sum(usPolo) / len(usPolo)



listToUse = usPolo

observeZMean = np.mean(listToUse)          
observeZSd = np.std(listToUse, ddof=1)     

actualZMean = observeZMean       
deConvulutedZSd = (observeZSd**2 - 1)

"""
the -1 is to adjust for a chi squared correction
means the Z value must fairly strong, >= 1
If we need to deconvulute, deconvulteZsD must be greater than 1

if observeZMean > 1 : means changes are signifigant
and
observeZSd < 1 : changes were signifigant, but do not need to deconvulute, skip deconvultion
Anything under 1 is not signifigant and should be ignored

Strong Z score: >= 1
deConvulutedZSd = (observeZSd**2 - 1)



"""



if observeZMean > 1 and observeZSd < 1:
        actualZSd = observeZSd
        print("no need for deconvulution")
else:
        actualZSd = math.sqrt(deConvulutedZSd) 
        print("need for deconvulution")


pThresList = np.arange(0.02, 0.98, 0.02)
zThresList = p2z(pThresList)


stalList = []
for zThres in zThresList:
    #Contribution from the actual lift at zActual = pdf(zActual) * prob(obsZ > zThres) * zActual
    def integrand(zActual):
        probActual = stat.norm(actualZMean,actualZSd).pdf(zActual)
        probObserveZMoreThanZThres = z2p(-(zActual-zThres))        
        return  probActual* probObserveZMoreThanZThres * zActual

    stal = intg.quad(integrand, -5, 5)[0]
    stalList = stalList + [stal]
    
    
    optimalPThres = pThresList[np.argmax(stalList)]
    
plt.plot(pThresList, stalList)
plt.xlim((0,1))
plt.axvline(optimalPThres, linestyle = '--')