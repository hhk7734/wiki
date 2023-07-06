.PHONY: remove_local
remove_local:
	git remote update --prune
	git checkout origin/main
	git for-each-ref --format '%(refname:short)' refs/heads | xargs -r git branch -D