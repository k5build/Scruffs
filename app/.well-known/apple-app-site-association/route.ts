import { NextResponse } from 'next/server';

// Apple Universal Links / App Site Association
// Update "appID" = "TEAMID.ae.scruffs.app" once you have your Apple Team ID
export async function GET() {
  const association = {
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAMID.ae.scruffs.app',
          paths: ['*'],
        },
      ],
    },
    webcredentials: {
      apps: ['TEAMID.ae.scruffs.app'],
    },
    activitycontinuation: {
      apps: ['TEAMID.ae.scruffs.app'],
    },
  };

  return new NextResponse(JSON.stringify(association), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
