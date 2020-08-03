import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Highlight from 'react-highlight';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className={clsx('col', styles.feature)}>
                <Highlight className='language-javascript'>
                  npm install --save kafka-streams
                </Highlight>
                <Highlight className='language-javascript'>
                  const {'{'} KafkaStreams {'}'} = require("kafka-streams");<br/>
                  const config = require("./config.json");<br/>
                  const factory = new KafkaStreams(config);<br/>
                  <br/>
                  const kstream = factory.getKStream("input-topic");<br/>
                  const ktable = factory.getKTable(/* .. */);<br/>
                  <br/>
                  kstream.merge(ktable).filter(/* .. */).map(/* .. */).reduce(/* .. */).to("output-topic");
                </Highlight>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
