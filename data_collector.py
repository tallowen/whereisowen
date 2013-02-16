import json
import os
import calendar
from datetime import datetime

import requests
from requests_oauthlib import OAuth1

account_id = os.environ['ACCOUNT_ID']

consumer_key = os.environ['CONSUMER_KEY']
consumer_secret = os.environ['CONSUMER_SECRET']
access_token = os.environ['ACCESS_TOKEN']
access_token_secret = os.environ['ACCESS_TOKEN_SECRET']

twitter_oauth = OAuth1(consumer_key, consumer_secret,
            access_token, access_token_secret)


twitter_api = 'https://api.twitter.com/1.1/%s'


def get_timestamp(twitter_timestamp):
    twitter_datetime = datetime.strptime(twitter_timestamp, "%a %b %d %H:%M:%S +0000 %Y")  # Tue Apr 26 08:57:55 +0000 2011
    return calendar.timegm(twitter_datetime.utctimetuple())


def twitter_get(end_point):
    if os.environ.get('OFFLINE', False):
        print 'Using fake data' + '\n' * 2
        with open('twitter_test_data.json') as f:
            import json
            return json.loads(f.read())

    path = twitter_api % end_point
    return requests.get(path, auth=twitter_oauth).json()


def filter_text(tweet):
    """
    Return the text as we want it to be displayed.

    Filters out shortened links and image links.
    """
    text = tweet['text']
    entities = tweet['entities']
    if 'urls' in entities:
        for url in entities['urls']:
            text = text.replace(url['url'], url['display_url'])

    if 'media' in entities:
        for media_element in entities['media']:
            if media_element['type'] == 'photo':
                text = text.replace(media_element['url'], '')

    return text


def get_stories():
    stories = []
    for tweet in twitter_get('statuses/user_timeline.json?user_id=%s' % account_id):
        coordinates = None
        if tweet['coordinates']:
            coordinates = tweet['coordinates']['coordinates']

        picture = None
        if 'media' in tweet['entities']:
            try:
                picture = tweet['entities']['media'][0]['media_url_https']
            except KeyError:
                picture = None

        stories.append({
            'coordinates': coordinates,
            'text': filter_text(tweet),
            'image': picture,
            'id': tweet['id'],
            'time': get_timestamp(tweet['created_at'])
            })

    return stories

if __name__ == '__main__':
    data = get_stories()
    with open('public/stories.json', 'w') as f:
        f.write(json.dumps(data))
    print data
