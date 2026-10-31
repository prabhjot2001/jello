export function TmdbCredit() {
  return (
    <footer className="px-4 pb-6 pt-2 text-center text-xs text-muted-foreground">
      <img
        src="/tmdb-logo.svg"
        alt="TMDB"
        className="mx-auto mb-1 h-3"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      This product uses the TMDB API but is not endorsed or certified by TMDB.
    </footer>
  );
}