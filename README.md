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

``` updating sellers.json
  git checkout main
  git pull
  rm -rf dist
  gulp build
  git add dist -f
  git commit -m "message"
  git push origin `git subtree split --prefix dist main`:gh-pages --force
  git reset --soft HEAD~1
  git stash
```   
