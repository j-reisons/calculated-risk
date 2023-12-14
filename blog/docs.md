---
layout: page
title: Docs
permalink: /docs/
---

### Model

The calculator's model is built on the following assumptions:

#### Time
* We are investing towards some time horizon.
* The time between now and the horizon is broken up into periods.
* We may change strategies at the end of a period.

#### Strategies
* We have some fixed set of strategies to consider investing in.
* The strategies are characterized by their return distributions. 
* The return distributions are constant over time.
* Strategy returns are independent of everything else in the model: there are no correlations or autocorrelations of any kind.

#### Cashflows
* We plan to save and spend money over time. 
* Each period has a fixed cashflow assigned to it which may be positive (deposit), negative (withdrawwal) or zero.

#### Utility of final wealth
* We aim to optimize the expected value of some function of wealth at the end of the time horizon: the utility of final wealth.


## Algorithm



Wealth discretization

Cashflows
Strategies 
Utility
Bankruptcy treatment
Boundary conditions

Trajectories

Strategies syntax
Supported distributions
Color stability

Cashflows view
syntax
plot
cashflow - period mismatch

Utility view
syntax
plot
utility
Terminal distribution
Aliasing