import Container from "../components/Layout/Container";
import Wrapper from '../components/Layout/Wrapper';
import Widget from '../components/Layout/Widget';
import PostItem from "../components/Home/PostItem";
import MoreStories from "../components/Home/MoreStories";
import Intro from "../components/intro";
import Layout from "../components/Layout";
import { getAllPosts } from "../lib/api";
import Head from "next/head";
import { Button } from 'antd';

export default function Index({ allPosts }) {
    const heroPost = allPosts[0];
    const morePosts = allPosts.slice(1);
    return (
        <Layout>
            <Head>
                <title>淡烘糕的学习笔记</title>
            </Head>
            <Intro />
            <Container>
                <Wrapper>
                    {heroPost && (
                        <PostItem
                            title={heroPost.title}
                            coverImage={heroPost.coverImage}
                            date={heroPost.date}
                            author={heroPost.author}
                            slug={heroPost.slug}
                            excerpt={heroPost.excerpt}
                            />
                    )}
                    {morePosts.length > 0 && <MoreStories posts={morePosts} />}
                </Wrapper>
                <Widget allPosts={allPosts} />
            </Container>
        </Layout>
    );
}

export async function getStaticProps() {
    const allPosts = getAllPosts([
        "title",
        "date",
        "slug",
        "author",
        "coverImage",
        "excerpt"
    ]);

    return {
        props: { allPosts }
    };
}
