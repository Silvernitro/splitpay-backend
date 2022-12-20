# SplitPay

<span>
  <img src="https://github.com/devicons/devicon/blob/master/icons/nestjs/nestjs-plain.svg" width="45px" alt="nest" />
  <img src="https://github.com/devicons/devicon/blob/master/icons/postgresql/postgresql-plain.svg" width="45px" alt="postgresql" />
</span>

Just the back-end of it here. SplitPay let's clients create bills that need to be
split amongst friends. You create a bill, add people to it, have each person indicate
what they've paid for and what they've consumed, and let SplitPay generate an
optimized set of transactions.

### A note on optimizing transactions

Unfortunately, the problem of optimzing transactions is NP-Complete.
I'm not going to go into that here, but you can show a reduction from either the
[Partition problem](https://www.alexirpan.com/2016/05/10/may-10.html) or
[Subset-Sum problem](https://medium.com/@mithunmk93/algorithm-behind-splitwises-debt-simplification-feature-8ac485e97688) to prove it.

As such, I used a [greedy approximation algorithm](https://www.alexirpan.com/2016/05/10/may-10.html) instead. Not sure what the relative performance guarantee is,
or if it's even a ρ-approximation. Alternatively, one can model this problem as a
max-flow problem and solve it with Dinic's or Edmonds-Karp but I just want to keep things simple.

## Running locally

I'll write this soon enough once I decide how I want to deploy and dockerize the app.

## Postman Tests

Kinda lazy to write unit and integration tests, so I went with e2e tests for the highest
ROI. I have a Postman test suite that I use to test locally and also on the CI
pipeline to test each build on Master. You can check out a live version of the
test suite here:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/11468810-f8a33e50-53c5-47a0-8db0-7c4d8d0b7c83?action=collection%2Ffork&collection-url=entityId%3D11468810-f8a33e50-53c5-47a0-8db0-7c4d8d0b7c83%26entityType%3Dcollection%26workspaceId%3D0a0c9131-4723-4877-ad2e-0ed43506c1cb)
