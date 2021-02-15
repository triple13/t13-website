# t13-website

Deployment 

If the Branch does not exists

```shell
  git subtree push --prefix dist origin gh-pages
```

If the branch needs to be updated

```shell
  git push origin `git subtree split --prefix dist main`:gh-pages --force
```

