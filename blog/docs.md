---
layout: page
title: Docs
permalink: /docs/
---

## Problem statement

### Model

The model of investing used by the calculator is based on the following assumptions:

#### Time
* We are investing towards some time horizon.
* The time between now and the horizon is broken up into periods.
* We may only change strategies at the end of a period.

#### Strategies
* We have a fixed, finite set of strategies we can invest in.
* The strategies are characterized by their return distributions. 
* The return distributions do not change over time.
* Strategy returns are independent of everything else in the model: there are no correlations or autocorrelations of any kind.

#### Cashflows
* We plan to save and spend money over time. 
* Each period has a fixed cashflow assigned to it which may be positive (deposit), negative (withdrawal) or zero.

#### Utility of final wealth
* We aim to optimize the expected value of some function of wealth at the end of the time horizon.

#### Bankruptcy
* Bankruptcy is permanent: if wealth drops to 0 due to negative cashflows or strategy returns it will stay at 0 for all subsequent periods.
* The utility of bankruptcy is set to 0, i.e. $ Utility(0) = 0 $.

### Questions

Given a set of strategies, a series of cashflows, a utility function, and a time horizon, we want to know:
* For every value of wealth and time
   * What strategy should be chosen to optimize expected utility ?
   * Given optimal strategy choices, what is the expected utility ?
* For a set starting wealth and time
    * Given optimal strategy choices, what is the probability distribution of wealth over time ?

## Calculator - Math

### Wealth discretization
The values of wealth for which the calculator answers these questions are restricted to $[0, wealth\\_max]$.  
In this range, wealth is discretized into bins according to parameters $lin\\_step$ and $log\\_step$.
* Between 0 and $\frac{lin\\_step}{log\\_step}$ bin boundaries are spaced linearly by $lin\\_step$.
* Between $\frac{lin\\_step}{log\\_step}$ and $wealth\\_max$ bin boundaries are spaced logarithmically by $log\\_step$.

E.g. with $wealth\\_max=400000$, $lin\\_step=1000$ and $log\\_step=0.01$.
  * Linear spacing up to $\frac{1000}{0.01}$:  
    $[0, 1000, 2000, ..., 99000, 100000,...]$
  * Log spacing up to $400000$ : $[..., 99000, 100000, 101000, 102010, 103030.1,..., \text{~}396000, \text{~}400000]$

Both linear and logarithmic bins get a wealth value assigned to them by taking the arithmetic mean of their boundaries:
$[500, 1500, 2500, ..., 99500, 100500, 102520.05, ..., \text{~}398000]$.

#### Boundary conditions

Additional wealth bins are added to serve as boundary conditions for the calculation.
* A single bin with boundaries $\[-\infty, 0\]$ represents the bankrupt state. No wealth value is assigned.
* A "coarse" logarithmic grid is introduced above $wealth\\_max$ up to $coarse\\_wealth\\_max$. The spacing is variable,
and gets larger with increasing wealth. $coarse\\_wealth\\_max$ and the spacings are determined by a kludgy scheme 
based on strategies, cashflows, $wealth\\_max$, $log\\_step$ and the number of periods. The purpose of this extended grid
is to provide better estimates of expected utility for the upper part of the $[0, wealth\\_max]$ range when using 
unbounded utility functions. The consequence of doing a poor job here is that the strategy choice would be biased towards conservative strategies, hence my comfort with a kludge.  
Bin wealth values are assigned by arithmetic mean of the boundaries.
* A bin with boundaries $[coarse\\_wealth\\_max, +\infty]$ sits at the top, with $coarse\\_wealth\\_max$ as its wealth value.

### Transition probabilities

The probability of transition $T_{p,s,i,j}$ from wealth bin $i$ at period $p$ to wealth bin $j$ at period $p+1$ under strategy $s$ is computed as:

$ T_{p,s,i,j} = CDF_{s}(\frac{Boundary_{j+1} - Cashflow_{p}}{Value_{i}} - 1) - CDF_{s}(\frac{Boundary_{j} - Cashflow_{p}}{Value_{i}} - 1)$

With 
* $CDF_{s}$ the cumulative distribution function of returns of strategy $s$
  * we use a 0-centered convention for returns: a 0% return means we have as much money as we started with, hence the $ -1 $
* $Cashflow_p$ the cashflow assigned to period $p$
* $ Boundary_{j} $ and $Boundary_{j+1}$ respectively the lower and upper boundaries of wealth bin $j$
* $ Value_{i} $ the wealth value assigned to bin $i$

Exception to this is the bankruptcy bin, which may only transition to itself:

$ T_{p,s,0,j} = \delta_{0,j} $ , with $ \delta_{i,j} $ the Kronecker delta.

### Dynamic programming

The algorithm used by the calculator to choose optimal strategies and compute the 
associated expected utilities exploits the problem's optimal substructure:
if the optimal expected utility as a function of wealth is known for the next period, then the maximal
expected utility each strategy can achieve if picked in the present period can be computed for any present value of wealth.
Then it is simply a matter of picking the strategy with the highest value for each value of wealth.

Given a problem with $P$ periods, $S$ strategies and a discretization of wealth into $I$ bins the algorithm is:
 * Allocate a matrix to store optimal expected utilities $U_{p,i}$ of size $P + 1$ by $I$.
 * Initialize $U_{P,i} = Utility(Value_i)$
 * Allocate a matrix to store optimal strategy choices $S_{p,i}$ of size $P$ by $I$
 * For each period $p$ starting from period $P-1$ working down to period $0$
   * For each wealth bin $i$ 
      * For each strategy $s$
        * Compute the strategies' expected utility: $u_{p,i,s} = \sum_{j} T_{p,s,i,j}\, U_{p+1,j}$
      * Pick the max and argmax, assign them to U and S
        * $U_{p,i} = max_s(u_{p,i,s})$
        * $S_{p,i} = argmax_s(u_{p,i,s})$

### Wealth trajectories

To compute how the probability distribution of wealth evolves from a starting point $(p',i')$ under optimal strategy choices:
  * Define the optimal transition probabilities $T_{p,i,j} = T_{p,S_{p,i},i,j}$
  * Allocate a matrix to store the probability distribution of wealth $D_{p,i}$ of size $P$ by $I$
  * Initialize $D_{p',i'} = 1$
  * For each period $p$ starting from $p' + 1$ working up to period $P - 1$
    * For each wealth bin $j$
      * Compute and assign the probability of being in the bin: $D_{p,j} = \sum_{i} T_{p-1,i,j}\,D_{p-1,i}$

### Calculator - User Interface

#### Grid form

The grid form allows to set $wealth\\_max$, $log\\_step$, $lin\\_step$, and the number of periods.  
This defines the wealth and time discretization over which the calculation takes place.  
The form fields expect integer inputs, except $log\\_step$ which also accepts decimals and expects a $\\%$ at the end.

#### Trajectories form

The trajectories form allows to set the starting wealth and period from which wealth trajectories are computed forward.
This can be done either through the corresponding form fields, or by selecting "Pick-on-click" and clicking on the desired
starting point on the policy map.

The wealth trajectories are plotted over the policy map as greyed-out confidence intervals.
This is configured by the confidence intervals field, which expects comma separated percentages.

#### Strategies form

The strategies form is for specifying strategy names and their associated return distributions.  
This is done by using a domain specific language that looks like this:

```
cash = delta(0%)
# commented_out_strategy = LogNormal(3%,5%)
coinflip = 0.5*delta(-1) + 0.5*delta(1)
equities = Normal(5%, 20%)
```
A strategy definition looks like an assignment, with the name on the left and return distribution on the right of the equals sign.

The following distributions are currently implemented
  * $Normal(\mu,\sigma)$
  * $LogNormal(\mu,\sigma)$
  * $delta(x)$, the dirac delta
  * $Cauchy(x,\gamma)$
  * Positive linear combinations of the above summing to one.
    * When writing a linear combination, the coefficient must come first in each linear term.

Strategy colors are determined by the order in which the strategies are specified: 
ordering strategies by their perceived riskiness is a good idea to get a legible policy map.

Commented lines start with '#'. Commented lines impact the colors of the remaining strategies:
the colorscale is chosen as if there was a strategy in place of the commented line.
This is done to allow visual comparison of strategy maps when exploring the effects of adding or removing strategies:
specify the superset of strategies to be considered, then comment out lines as needed.

Due to quirks in the solver implementation, if multiple strategies are present with identical return distributions then none
will be selected: don't specify duplicates.

Where a number is expected, i.e. linear coefficients and distribution arguments, any expression that [MathJS](https://mathjs.org/) can handle will work.
E.g. for specifying 0.5 you can write ```0.5```, ```50%```, ```1/2```, but also weirder things like ```sin(pi/6)```.

The distribution plot below the input box allows you to check that the strategies have been specified as intended.
Hovering over a distribution brings up the value of the return CDF at that point.  
The distributions are plotted with $log\\_step$ resolution, which can serve as a quick check that the wealth discretization is fine enough to represent the distributions well.

#### Cashflows form
The cashflows form is for specifying each periods cashflows.
This is done by writing a short [MathJS](https://mathjs.org/) script.
The script should assign a 1D array of numbers to the "cashflows" variable.
A few examples of valid input:

```
cashflows = []
```

```
cashflows = [1,2,3,4,5]
```

```
cashflows = 40000*concat(ones(5),zeros(5)) - 30000*concat(zeros(5),ones(5))
```

```
horizon = 80
retirement = 40
deposits = 40000 * concat(ones(retirement),zeros(horizon-retirement))
withdrawals = -30000 * concat(zeros(retirement),ones(horizon-retirement))
cashflows = deposits + withdrawals
```

In case of a mismatch between the length of the specified array and the number of periods the array is either truncated or extended with zeroes to match the number of periods.  
A bar chart below the input box allows to visualize the final array.

#### Utility form
The utility form is for specifying a utility function.
This is done by writing a short [MathJS](https://mathjs.org/) script.  
The script should assign a $[1, +\infty] \to \mathbb{R}^+$ function to the "Utility(w)" variable.  
You will usually want this function to be monotonic and concave, but the calculator will not force you.  

Some examples of input:
```
Utility(w) = w
```
```
Utility(w) = log(w)
```
```
gamma = 2
Utility(w) = gamma == 1 ? log(w) : (w^(1-gamma) - 1) / (1 - gamma)
```

syntax
plot
utility
Terminal distribution

#### Policy map

#### Deeplinks

### Known issues
Grey screen of death

Aliasing
